const prisma = require("../lib/prisma");

/**
 * POST /api/workspaces
 * Create a new workspace for the authenticated user.
 */
const createWorkspace = async (req, res, next) => {
  try {
    const { nama_workspace } = req.body;
    const { id_user } = req.user;

    const workspace = await prisma.workspace.create({
      data: {
        id_user,
        nama_workspace,
      },
    });

    return res.status(201).json({
      status: "success",
      message: "Workspace created.",
      data: workspace,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/workspaces
 * List all workspaces for the authenticated user.
 */
const getWorkspaces = async (req, res, next) => {
  try {
    const { id_user } = req.user;

    const workspaces = await prisma.workspace.findMany({
      where: { id_user },
      orderBy: { created_at: "desc" },
      include: {
        _count: {
          select: { designs: true },
        },
      },
    });

    return res.status(200).json({
      status: "success",
      data: workspaces,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/workspaces/:id
 * Get a single workspace WITH its designs (joined).
 */
const getWorkspaceById = async (req, res, next) => {
  try {
    const workspaceId = parseInt(req.params.id, 10);
    const { id_user } = req.user;

    const workspace = await prisma.workspace.findFirst({
      where: {
        id_workspace: workspaceId,
        id_user, // Ensure ownership
      },
      include: {
        designs: {
          orderBy: { updated_at: "desc" },
          select: {
            id_design: true,
            nama_design: true,
            deskripsi: true,
            config: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    });

    if (!workspace) {
      return res.status(404).json({
        status: "error",
        message: "Workspace not found.",
      });
    }

    return res.status(200).json({
      status: "success",
      data: workspace,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/workspaces/:id
 * Delete a workspace (cascades to designs + details).
 */
const deleteWorkspace = async (req, res, next) => {
  try {
    const workspaceId = parseInt(req.params.id, 10);
    const { id_user } = req.user;

    // Verify ownership before deleting
    const workspace = await prisma.workspace.findFirst({
      where: { id_workspace: workspaceId, id_user },
    });

    if (!workspace) {
      return res.status(404).json({
        status: "error",
        message: "Workspace not found.",
      });
    }

    await prisma.workspace.delete({
      where: { id_workspace: workspaceId },
    });

    return res.status(200).json({
      status: "success",
      message: "Workspace deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  deleteWorkspace,
};
