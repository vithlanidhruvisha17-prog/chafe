const prisma = require('../config/prisma');
const slugify = require('../utils/slugify');
const { uploadImage, deleteImage } = require('./storageService');

const getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      subCategories: {
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: { menuItems: true },
          },
        },
      },
    },
  });
};

const getCategoryBySlug = async (slugOrId) => {
  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { slug: slugOrId },
        { id: slugOrId },
      ],
    },
    include: {
      subCategories: {
        orderBy: { sortOrder: 'asc' },
        include: {
          menuItems: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  });

  if (!category) {
    const error = new Error(`Category '${slugOrId}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  return category;
};

const createCategory = async (data, file) => {
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);

  let imageUrl = data.imageUrl || null;
  if (file) {
    const uploadResult = await uploadImage(file, 'categories');
    imageUrl = uploadResult.url;
  }

  return await prisma.category.create({
    data: {
      name: data.name.trim(),
      slug,
      sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
      imageUrl,
    },
    include: {
      subCategories: true,
    },
  });
};

const updateCategory = async (id, data, file) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error(`Category with ID '${id}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  let imageUrl = data.imageUrl !== undefined ? data.imageUrl : existing.imageUrl;
  if (file) {
    const uploadResult = await uploadImage(file, 'categories');
    imageUrl = uploadResult.url;

    if (existing.imageUrl) {
      try {
        await deleteImage(existing.imageUrl);
      } catch (err) {
        console.warn('Could not remove previous category image:', err.message);
      }
    }
  }

  let slug = existing.slug;
  if (data.slug) {
    slug = slugify(data.slug);
  } else if (data.name && data.name !== existing.name) {
    slug = slugify(data.name);
  }

  return await prisma.category.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(slug && { slug }),
      ...(data.sortOrder !== undefined && { sortOrder: Number(data.sortOrder) }),
      imageUrl,
    },
    include: {
      subCategories: true,
    },
  });
};

const deleteCategory = async (id) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error(`Category with ID '${id}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  const deleted = await prisma.category.delete({
    where: { id },
  });

  if (existing.imageUrl) {
    try {
      await deleteImage(existing.imageUrl);
    } catch (err) {
      console.warn('Could not remove category image from storage:', err.message);
    }
  }

  return deleted;
};

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
