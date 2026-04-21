const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");

/**
 * JWT Authentication Middleware
 * Verifies Bearer token and attaches req.user = { id_user, email, role }
 */
const authenticate = (req, res, next) => {
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
    req.user = {
      id_user: decoded.id_user,
      email: decoded.email,
      role: decoded.role,
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
