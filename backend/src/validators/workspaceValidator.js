const { z } = require("zod");

const createWorkspaceSchema = z.object({
  nama_workspace: z
    .string({ required_error: "Workspace name is required." })
    .min(1, "Workspace name cannot be empty.")
    .max(100, "Workspace name cannot exceed 100 characters."),
});

module.exports = { createWorkspaceSchema };
