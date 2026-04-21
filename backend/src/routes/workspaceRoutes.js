const { Router } = require("express");
const {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  deleteWorkspace,
} = require("../controllers/workspaceController");
const { authenticate } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { createWorkspaceSchema } = require("../validators/workspaceValidator");

const router = Router();

// All workspace routes require authentication
router.use(authenticate);

// POST /api/workspaces
router.post("/", validate(createWorkspaceSchema), createWorkspace);

// GET /api/workspaces
router.get("/", getWorkspaces);

// GET /api/workspaces/:id  (includes designs array)
router.get("/:id", getWorkspaceById);

// DELETE /api/workspaces/:id
router.delete("/:id", deleteWorkspace);

module.exports = router;
