const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { checkPlan } = require("../middlewares/checkPlan");
const { updatePlan, getPlan, updateWatermark } = require("../controllers/planController");

// Get current plan + features
router.get("/", authenticate, getPlan);

// Update plan (simulated — no payment gateway)
router.put("/", authenticate, updatePlan);

// Update watermark (Business only)
router.put("/watermark", authenticate, checkPlan(["business"]), updateWatermark);

module.exports = router;
