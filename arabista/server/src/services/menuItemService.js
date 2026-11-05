const prisma = require('../config/prisma');
const { uploadImage, deleteImage } = require('./storageService');

const getMenuItems = async ({ search, category, available }) => {
  const where = {};

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
    ];
  }

  if (category && category.trim()) {
    const cat = category.trim();
    where.subCategory = {
      category: {
        OR: [
          { id: cat },
          { slug: cat },
          { name: { equals: cat, mode: 'insensitive' } },
        ],
      },
    };
  }

  if (available !== undefined && available !== null && available !== '') {
    where.isAvailable = available === 'true' || available === true;
  }

  return await prisma.menuItem.findMany({
    where,
    orderBy: [
      { sortOrder: 'asc' },
      { createdAt: 'desc' },
    ],
    include: {
      subCategory: {
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });
};

const getSignatureItems = async () => {
  return await prisma.menuItem.findMany({
    where: {
      isSignature: true,
      isAvailable: true,
    },
    orderBy: { sortOrder: 'asc' },
    include: {
      subCategory: {
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });
};

const getMenuItemById = async (id) => {
  const item = await prisma.menuItem.findUnique({
    where: { id },
    include: {
      subCategory: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!item) {
    const error = new Error(`Menu item with ID '${id}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  return item;
};

const createMenuItem = async (data, file) => {
  const subCategory = await prisma.subCategory.findUnique({
    where: { id: data.subCategoryId },
  });

  if (!subCategory) {
    const error = new Error(`SubCategory with ID '${data.subCategoryId}' does not exist.`);
    error.statusCode = 404;
    throw error;
  }

  let imageUrl = data.imageUrl || null;
  if (file) {
    const uploadResult = await uploadImage(file, 'menu');
    imageUrl = uploadResult.url;
  }

  return await prisma.menuItem.create({
    data: {
      name: data.name.trim(),
      description: data.description ? data.description.trim() : null,
      price: Number(data.price),
      imageUrl,
      subCategoryId: data.subCategoryId,
      isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
      isSignature: data.isSignature !== undefined ? Boolean(data.isSignature) : false,
      sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
    },
    include: {
      subCategory: {
        include: {
          category: true,
        },
      },
    },
  });
};

const updateMenuItem = async (id, data, file) => {
  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error(`Menu item with ID '${id}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  if (data.subCategoryId) {
    const sub = await prisma.subCategory.findUnique({ where: { id: data.subCategoryId } });
    if (!sub) {
      const error = new Error(`SubCategory with ID '${data.subCategoryId}' does not exist.`);
      error.statusCode = 404;
      throw error;
    }
  }

  let imageUrl = data.imageUrl !== undefined ? data.imageUrl : existing.imageUrl;
  if (file) {
    const uploadResult = await uploadImage(file, 'menu');
    imageUrl = uploadResult.url;

    if (existing.imageUrl) {
      try {
        await deleteImage(existing.imageUrl);
      } catch (err) {
        console.warn('Could not remove previous menu item image:', err.message);
      }
    }
  }

  return await prisma.menuItem.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description ? data.description.trim() : null }),
      ...(data.price !== undefined && { price: Number(data.price) }),
      ...(data.subCategoryId && { subCategoryId: data.subCategoryId }),
      ...(data.isAvailable !== undefined && { isAvailable: Boolean(data.isAvailable) }),
      ...(data.isSignature !== undefined && { isSignature: Boolean(data.isSignature) }),
      ...(data.sortOrder !== undefined && { sortOrder: Number(data.sortOrder) }),
      imageUrl,
    },
    include: {
      subCategory: {
        include: {
          category: true,
        },
      },
    },
  });
};

const toggleAvailability = async (id) => {
  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error(`Menu item with ID '${id}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  return await prisma.menuItem.update({
    where: { id },
    data: {
      isAvailable: !existing.isAvailable,
    },
    include: {
      subCategory: true,
    },
  });
};

const deleteMenuItem = async (id) => {
  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error(`Menu item with ID '${id}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  const deleted = await prisma.menuItem.delete({
    where: { id },
  });

  if (existing.imageUrl) {
    try {
      await deleteImage(existing.imageUrl);
    } catch (err) {
      console.warn('Could not remove menu item image from storage:', err.message);
    }
  }

  return deleted;
};

module.exports = {
  getMenuItems,
  getSignatureItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
};
