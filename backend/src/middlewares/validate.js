/**
 * Zod Validation Middleware Factory
 * Usage: router.post("/path", validate(myZodSchema), controller)
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return res.status(400).json({
      status: "error",
      message: "Validation failed.",
      errors,
    });
  }

  // Replace req.body with parsed (sanitized) data
  req.body = result.data;
  next();
};

module.exports = { validate };
