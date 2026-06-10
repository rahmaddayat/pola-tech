const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const { checkPlan } = require("../middlewares/checkPlan");
const { chat, generateShape } = require("../controllers/aiController");

// AI Chat is only for business users
router.post("/chat", authenticate, checkPlan(["business"]), chat);
router.post("/generate-shape", generateShape); // Open for now to make it easy to test

module.exports = router;
