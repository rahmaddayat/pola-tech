const prisma = require("../lib/prisma");

// Config keys that map directly to Component.nama_component
const CONFIG_COMPONENT_KEYS = [
  "body",
  "sleeves",
  "necklines",
  "pocket",
  "primaryColor",
  "pattern",
];

/**
 * Helper: Auto-generate Design_Detail rows from a config object.
 * Looks up Component rows by nama_component (static ref data from seed).
 * Only creates details for config keys that have a matching Component.
 */
const syncDesignDetails = async (designId, config) => {
  // Fetch all components once (small static table)
  const components = await prisma.component.findMany();
  const componentMap = new Map(components.map((c) => [c.nama_component, c]));

  // Delete existing details for this design
  await prisma.design_Detail.deleteMany({ where: { id_design: designId } });

  // Build new detail rows
  const detailsToCreate = [];
  for (const key of CONFIG_COMPONENT_KEYS) {
    const value = config[key];
    const component = componentMap.get(key);

    // Skip if value is null/undefined or no matching component
    if (value == null || value === "" || !component) continue;

    detailsToCreate.push({
      id_design: designId,
      id_component: component.id_component,
      value: String(value),
    });
  }

  if (detailsToCreate.length > 0) {
    await prisma.design_Detail.createMany({ data: detailsToCreate });
  }

  return detailsToCreate.length;
};

/**
 * POST /api/designs
 * Create a design. Auto-generates Design_Detail rows from config.
 */
const createDesign = async (req, res, next) => {
  try {
    const { id_workspace, nama_design, deskripsi, config } = req.body;
    const { id_user } = req.user;

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: { id_workspace, id_user },
    });

    if (!workspace) {
      return res.status(404).json({
        status: "error",
        message: "Workspace not found.",
      });
    }

    // Check if name already exists in workspace
    const existingDesign = await prisma.design.findFirst({
      where: {
        id_workspace,
        nama_design: { equals: nama_design, mode: "insensitive" },
      },
    });

    if (existingDesign) {
      return res.status(400).json({
        status: "error",
        message: "Nama desain sudah terpakai. Silakan gunakan nama lain.",
      });
    }

    // Create design with JSON config
    const design = await prisma.design.create({
      data: {
        id_workspace,
        nama_design,
        deskripsi: deskripsi || null,
        config,
      },
    });

    // Auto-generate Design_Detail rows
    const detailCount = await syncDesignDetails(design.id_design, config);

    return res.status(201).json({
      status: "success",
      message: "Design created successfully.",
      data: {
        ...design,
        details_generated: detailCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/designs/:workspace_id
 * List all designs in a workspace.
 * Supports pagination (?page=1&limit=10) and search (?search=shirt).
 */
const getDesigns = async (req, res, next) => {
  try {
    const workspaceId = parseInt(req.params.workspace_id, 10);
    const { id_user } = req.user;

    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
      where: { id_workspace: workspaceId, id_user },
    });

    if (!workspace) {
      return res.status(404).json({
        status: "error",
        message: "Workspace not found.",
      });
    }

    // Pagination
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // Search
    const search = req.query.search?.trim() || "";
    const where = {
      id_workspace: workspaceId,
      ...(search && {
        nama_design: { contains: search, mode: "insensitive" },
      }),
    };

    // Parallel: get count + paginated results
    const [total, designs] = await Promise.all([
      prisma.design.count({ where }),
      prisma.design.findMany({
        where,
        orderBy: { updated_at: "desc" },
        skip,
        take: limit,
        select: {
          id_design: true,
          nama_design: true,
          deskripsi: true,
          config: true,
          created_at: true,
          updated_at: true,
        },
      }),
    ]);

    return res.status(200).json({
      status: "success",
      data: designs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/designs/:id
 * Get a single design with full Design_Detail breakdown.
 */
const getDesignById = async (req, res, next) => {
  try {
    const designId = parseInt(req.params.id, 10);
    const { id_user } = req.user;

    const design = await prisma.design.findFirst({
      where: { id_design: designId },
      include: {
        workspace: {
          select: { id_workspace: true, nama_workspace: true, id_user: true },
        },
        details: {
          include: {
            component: {
              select: {
                id_component: true,
                nama_component: true,
                tipe: true,
              },
            },
          },
        },
      },
    });

    if (!design) {
      return res.status(404).json({
        status: "error",
        message: "Design not found.",
      });
    }

    // Ownership check through workspace
    if (design.workspace.id_user !== id_user) {
      return res.status(403).json({
        status: "error",
        message: "Access denied.",
      });
    }

    return res.status(200).json({
      status: "success",
      data: design,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/designs/:id
 * Update a design. Re-syncs Design_Detail rows if config changes.
 */
const updateDesign = async (req, res, next) => {
  try {
    const designId = parseInt(req.params.id, 10);
    const { id_user } = req.user;
    const { nama_design, deskripsi, config } = req.body;

    // Fetch existing + verify ownership
    const existing = await prisma.design.findFirst({
      where: { id_design: designId },
      include: {
        workspace: { select: { id_user: true } },
      },
    });

    if (!existing) {
      return res.status(404).json({
        status: "error",
        message: "Design not found.",
      });
    }

    if (existing.workspace.id_user !== id_user) {
      return res.status(403).json({
        status: "error",
        message: "Access denied.",
      });
    }

    // Check for duplicate name if name is being updated
    if (nama_design !== undefined && nama_design !== existing.nama_design) {
      const duplicate = await prisma.design.findFirst({
        where: {
          id_workspace: existing.id_workspace,
          nama_design: { equals: nama_design, mode: "insensitive" },
        },
      });

      if (duplicate) {
        return res.status(400).json({
          status: "error",
          message: "Nama desain sudah terpakai. Silakan gunakan nama lain.",
        });
      }
    }

    // Build update payload — only include provided fields
    const updateData = {};
    if (nama_design !== undefined) updateData.nama_design = nama_design;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (config !== undefined) updateData.config = config;

    const updated = await prisma.design.update({
      where: { id_design: designId },
      data: updateData,
    });

    // Re-sync Design_Details if config was updated
    let detailCount = null;
    if (config !== undefined) {
      detailCount = await syncDesignDetails(designId, config);
    }

    return res.status(200).json({
      status: "success",
      message: "Design updated successfully.",
      data: {
        ...updated,
        ...(detailCount !== null && { details_generated: detailCount }),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/designs/:id
 * Delete a design (cascades to Design_Details).
 */
const deleteDesign = async (req, res, next) => {
  try {
    const designId = parseInt(req.params.id, 10);
    const { id_user } = req.user;

    const existing = await prisma.design.findFirst({
      where: { id_design: designId },
      include: {
        workspace: { select: { id_user: true } },
      },
    });

    if (!existing) {
      return res.status(404).json({
        status: "error",
        message: "Design not found.",
      });
    }

    if (existing.workspace.id_user !== id_user) {
      return res.status(403).json({
        status: "error",
        message: "Access denied.",
      });
    }

    await prisma.design.delete({ where: { id_design: designId } });

    return res.status(200).json({
      status: "success",
      message: "Design deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createDesign,
  getDesigns,
  getDesignById,
  updateDesign,
  deleteDesign,
};
