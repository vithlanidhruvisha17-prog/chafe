const prisma = require('../config/prisma');
const slugify = require('../utils/slugify');
const { uploadImage, deleteImage } = require('./storageService');

const getAllSubCategories = async (categoryId) => {
  return await prisma.subCategory.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy: { sortOrder: 'asc' },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: { menuItems: true },
      },
    },
  });
};

const getSubCategoryBySlug = async (slugOrId) => {
  const subCategory = await prisma.subCategory.findFirst({
    where: {
      OR: [
        { slug: slugOrId },
        { id: slugOrId },
      ],
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      menuItems: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!subCategory) {
    const error = new Error(`SubCategory '${slugOrId}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  return subCategory;
};

const createSubCategory = async (data, file) => {
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    const error = new Error(`Parent category with ID '${data.categoryId}' does not exist.`);
    error.statusCode = 404;
    throw error;
  }

  const slug = data.slug ? slugify(data.slug) : slugify(data.name);

  let imageUrl = data.imageUrl || null;
  if (file) {
    const uploadResult = await uploadImage(file, 'subcategories');
    imageUrl = uploadResult.url;
  }

  return await prisma.subCategory.create({
    data: {
      name: data.name.trim(),
      slug,
      categoryId: data.categoryId,
      sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
      imageUrl,
    },
    include: {
      category: true,
      menuItems: true,
    },
  });
};

const updateSubCategory = async (id, data, file) => {
  const existing = await prisma.subCategory.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error(`SubCategory with ID '${id}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  if (data.categoryId) {
    const cat = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!cat) {
      const error = new Error(`Target category with ID '${data.categoryId}' does not exist.`);
      error.statusCode = 404;
      throw error;
    }
  }

  let imageUrl = data.imageUrl !== undefined ? data.imageUrl : existing.imageUrl;
  if (file) {
    const uploadResult = await uploadImage(file, 'subcategories');
    imageUrl = uploadResult.url;

    if (existing.imageUrl) {
      try {
        await deleteImage(existing.imageUrl);
      } catch (err) {
        console.warn('Could not remove previous subcategory image:', err.message);
      }
    }
  }

  let slug = existing.slug;
  if (data.slug) {
    slug = slugify(data.slug);
  } else if (data.name && data.name !== existing.name) {
    slug = slugify(data.name);
  }

  return await prisma.subCategory.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(slug && { slug }),
      ...(data.categoryId && { categoryId: data.categoryId }),
      ...(data.sortOrder !== undefined && { sortOrder: Number(data.sortOrder) }),
      imageUrl,
    },
    include: {
      category: true,
      menuItems: true,
    },
  });
};

const deleteSubCategory = async (id) => {
  const existing = await prisma.subCategory.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error(`SubCategory with ID '${id}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  const deleted = await prisma.subCategory.delete({
    where: { id },
  });

  if (existing.imageUrl) {
    try {
      await deleteImage(existing.imageUrl);
    } catch (err) {
      console.warn('Could not remove subcategory image from storage:', err.message);
    }
  }

  return deleted;
};

module.exports = {
  getAllSubCategories,
  getSubCategoryBySlug,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
};
