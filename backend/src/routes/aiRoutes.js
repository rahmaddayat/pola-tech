const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { checkPlan } = require("../middlewares/checkPlan");
const { chat } = require("../controllers/aiController");

// AI Chat is only for business users
router.post("/chat", authenticate, checkPlan(["business"]), chat);

module.exports = router;
