const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const loginAdmin = async (email, password) => {
  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!admin) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordMatch = await bcrypt.compare(password, admin.password);
  if (!isPasswordMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const tokenPayload = {
    id: admin.id,
    email: admin.email,
  };

  const secret = process.env.JWT_SECRET || 'arabista_jwt_secret_change_in_production_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  const token = jwt.sign(tokenPayload, secret, { expiresIn });

  return {
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      createdAt: admin.createdAt,
    },
  };
};

const getAdminProfile = async (adminId) => {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!admin) {
    const error = new Error('Admin not found.');
    error.statusCode = 404;
    throw error;
  }

  return admin;
};

module.exports = {
  loginAdmin,
  getAdminProfile,
};
