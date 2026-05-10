/**
 * Middleware: Check user plan access for specific features.
 * Usage: router.post("/feature", auth, checkPlan(["pro", "business"]), controller)
 */
const PLAN_HIERARCHY = { lite: 1, pro: 2, business: 3 };

const checkPlan = (requiredPlans) => {
  return (req, res, next) => {
    const userPlan = req.user?.plan || "lite";

    if (!requiredPlans.includes(userPlan)) {
      return res.status(403).json({
        status: "error",
        message: `Fitur ini memerlukan paket ${requiredPlans.join(" atau ")}. Anda saat ini menggunakan paket ${userPlan}.`,
        required_plans: requiredPlans,
        current_plan: userPlan,
      });
    }

    next();
  };
};

/**
 * Middleware: Check design storage limit based on plan.
 * Lite = max 5, Pro/Business = unlimited
 */
const checkDesignLimit = async (req, res, next) => {
  const prisma = require("../lib/prisma");
  const userPlan = req.user?.plan || "lite";

  if (userPlan !== "lite") {
    return next(); // Pro and Business have unlimited
  }

  try {
    // Count total designs across all user workspaces
    const totalDesigns = await prisma.design.count({
      where: {
        workspace: { id_user: req.user.id_user },
      },
    });

    if (totalDesigns >= 5) {
      return res.status(403).json({
        status: "error",
        message: "Paket Lite hanya mendukung maksimal 5 desain. Upgrade ke paket Pro untuk desain unlimited.",
        current_count: totalDesigns,
        max_count: 5,
        current_plan: userPlan,
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { checkPlan, checkDesignLimit, PLAN_HIERARCHY };
