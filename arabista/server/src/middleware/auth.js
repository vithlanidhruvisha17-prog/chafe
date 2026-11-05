const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

const protectAdmin = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Access denied. No authorization token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Access denied. Malformed authorization token.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'arabista_jwt_secret_change_in_production_2026');

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Access denied. Admin account no longer exists.',
      });
    }

    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid authentication token.',
    });
  }
});

module.exports = {
  protectAdmin,
};
