const prisma = require('../config/prisma');
const { uploadImage, deleteImage } = require('./storageService');

const getActiveGallery = async () => {
  return await prisma.galleryImage.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
};

const getAllGallery = async () => {
  return await prisma.galleryImage.findMany({
    orderBy: { sortOrder: 'asc' },
  });
};

const createGallery = async (data, file) => {
  let imageUrl = data.imageUrl || null;
  if (file) {
    const uploadResult = await uploadImage(file, 'gallery');
    imageUrl = uploadResult.url;
  }

  if (!imageUrl) {
    const error = new Error('Gallery image is required (either upload file or provide imageUrl).');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.galleryImage.create({
    data: {
      title: data.title ? data.title.trim() : null,
      imageUrl,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
    },
  });
};

const updateGallery = async (id, data, file) => {
  const existing = await prisma.galleryImage.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error(`Gallery item with ID '${id}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  let imageUrl = data.imageUrl !== undefined ? data.imageUrl : existing.imageUrl;
  if (file) {
    const uploadResult = await uploadImage(file, 'gallery');
    imageUrl = uploadResult.url;

    if (existing.imageUrl) {
      try {
        await deleteImage(existing.imageUrl);
      } catch (err) {
        console.warn('Could not remove previous gallery image:', err.message);
      }
    }
  }

  return await prisma.galleryImage.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title ? data.title.trim() : null }),
      ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
      ...(data.sortOrder !== undefined && { sortOrder: Number(data.sortOrder) }),
      imageUrl,
    },
  });
};

const deleteGallery = async (id) => {
  const existing = await prisma.galleryImage.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error(`Gallery item with ID '${id}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  const deleted = await prisma.galleryImage.delete({
    where: { id },
  });

  if (existing.imageUrl) {
    try {
      await deleteImage(existing.imageUrl);
    } catch (err) {
      console.warn('Could not remove gallery image from storage:', err.message);
    }
  }

  return deleted;
};

module.exports = {
  getActiveGallery,
  getAllGallery,
  createGallery,
  updateGallery,
  deleteGallery,
};
