const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");
const prisma = require("../lib/prisma");

/**
 * JWT Authentication Middleware
 * Verifies Bearer token and attaches req.user = { id_user, email, role, plan }
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch fresh plan from database
    const user = await prisma.user.findUnique({
      where: { id_user: decoded.id_user },
      select: { id_user: true, email: true, role: true, plan: true },
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User not found.",
      });
    }

    req.user = {
      id_user: user.id_user,
      email: user.email,
      role: user.role,
      plan: user.plan || "lite",
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token expired. Please login again.",
      });
    }
    return res.status(401).json({
      status: "error",
      message: "Invalid token.",
    });
  }
};

module.exports = { authenticate };
