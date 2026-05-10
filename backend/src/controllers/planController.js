const prisma = require("../lib/prisma");

const VALID_PLANS = ["lite", "pro", "business"];

/**
 * PUT /api/plan
 * Update user's plan. In production, this would be triggered after payment.
 */
const updatePlan = async (req, res, next) => {
  try {
    const { id_user } = req.user;
    const { plan } = req.body;

    if (!plan || !VALID_PLANS.includes(plan)) {
      return res.status(400).json({
        status: "error",
        message: `Plan tidak valid. Pilihan: ${VALID_PLANS.join(", ")}`,
      });
    }

    const updated = await prisma.user.update({
      where: { id_user },
      data: { plan },
      select: {
        id_user: true,
        nama: true,
        email: true,
        role: true,
        plan: true,
      },
    });

    return res.status(200).json({
      status: "success",
      message: `Plan berhasil diubah ke ${plan}.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/plan
 * Get current user's plan info + feature access.
 */
const getPlan = async (req, res, next) => {
  try {
    const { id_user } = req.user;

    const user = await prisma.user.findUnique({
      where: { id_user },
      select: { plan: true, watermark_url: true },
    });

    const plan = user?.plan || "lite";

    const features = {
      lite: {
        max_designs: 5,
        export_formats: ["svg", "pdf"],
        custom_fabric: true,
        size_grading: false,
        canvas_drawing: false,
        ai_assistant: false,
        watermark: false,
        material_report: false,
        multi_user: false,
      },
      pro: {
        max_designs: -1, // unlimited
        export_formats: ["svg", "pdf", "png"],
        custom_fabric: true,
        size_grading: true,
        canvas_drawing: false,
        ai_assistant: false,
        watermark: false,
        material_report: false,
        multi_user: false,
      },
      business: {
        max_designs: -1,
        export_formats: ["svg", "pdf", "png"],
        custom_fabric: true,
        size_grading: true,
        canvas_drawing: true,
        ai_assistant: true,
        watermark: true,
        material_report: true,
        multi_user: true,
      },
    };

    return res.status(200).json({
      status: "success",
      data: {
        plan,
        watermark_url: user?.watermark_url || null,
        features: features[plan] || features.lite,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/plan/watermark
 * Update user's watermark URL (Business only).
 */
const updateWatermark = async (req, res, next) => {
  try {
    const { id_user } = req.user;
    const { watermark_url } = req.body;

    const updated = await prisma.user.update({
      where: { id_user },
      data: { watermark_url: watermark_url || null },
      select: { id_user: true, watermark_url: true },
    });

    return res.status(200).json({
      status: "success",
      message: "Watermark berhasil diupdate.",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { updatePlan, getPlan, updateWatermark };
