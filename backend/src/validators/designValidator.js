const { z } = require("zod");

// Design config object — maps directly to frontend useDesignCanvas state
const designConfigSchema = z.object({
  body: z.string().min(1, "body is required."),
  sleeves: z.string().min(1, "sleeves is required."),
  necklines: z.string().min(1, "necklines is required."),
  pocket: z.string().min(1, "pocket is required."),
  primaryColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3,8})$/, "primaryColor must be a valid hex color (e.g. #FFFFFF)."),
  pattern: z.string().nullable().optional(),
});

const createDesignSchema = z.object({
  id_workspace: z
    .number({ required_error: "id_workspace is required." })
    .int()
    .positive("id_workspace must be a positive integer."),
  nama_design: z
    .string({ required_error: "Design name is required." })
    .min(1, "Design name cannot be empty.")
    .max(150, "Design name cannot exceed 150 characters."),
  deskripsi: z.string().max(500).optional().nullable(),
  config: designConfigSchema,
});

const updateDesignSchema = z.object({
  nama_design: z
    .string()
    .min(1, "Design name cannot be empty.")
    .max(150)
    .optional(),
  deskripsi: z.string().max(500).optional().nullable(),
  config: designConfigSchema.optional(),
});

module.exports = { createDesignSchema, updateDesignSchema };
