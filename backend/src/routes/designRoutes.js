const { Router } = require("express");
const {
  createDesign,
  getDesigns,
  getDesignById,
  updateDesign,
  deleteDesign,
} = require("../controllers/designController");
const { authenticate } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const {
  createDesignSchema,
  updateDesignSchema,
} = require("../validators/designValidator");

const router = Router();

// All design routes require authentication
router.use(authenticate);

// POST /api/designs               — Create design
router.post("/", validate(createDesignSchema), createDesign);

// GET /api/designs/:workspace_id  — List designs in workspace (paginated + searchable)
router.get("/:workspace_id", getDesigns);

// GET /api/designs/detail/:id     — Get single design with full details
router.get("/detail/:id", getDesignById);

// PUT /api/designs/:id            — Update design
router.put("/:id", validate(updateDesignSchema), updateDesign);

// DELETE /api/designs/:id         — Delete design
router.delete("/:id", deleteDesign);

module.exports = router;
