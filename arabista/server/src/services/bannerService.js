const prisma = require('../config/prisma');
const { uploadImage, deleteImage } = require('./storageService');

const getActiveBanners = async () => {
  return await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
};

const getAllBanners = async () => {
  return await prisma.banner.findMany({
    orderBy: { sortOrder: 'asc' },
  });
};

const createBanner = async (data, file) => {
  let imageUrl = data.imageUrl || null;
  if (file) {
    const uploadResult = await uploadImage(file, 'banners');
    imageUrl = uploadResult.url;
  }

  if (!imageUrl) {
    const error = new Error('Banner image is required (either upload file or provide imageUrl).');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.banner.create({
    data: {
      title: data.title.trim(),
      subtitle: data.subtitle ? data.subtitle.trim() : null,
      imageUrl,
      linkUrl: data.linkUrl ? data.linkUrl.trim() : null,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
    },
  });
};

const updateBanner = async (id, data, file) => {
  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error(`Banner with ID '${id}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  let imageUrl = data.imageUrl !== undefined ? data.imageUrl : existing.imageUrl;
  if (file) {
    const uploadResult = await uploadImage(file, 'banners');
    imageUrl = uploadResult.url;

    if (existing.imageUrl) {
      try {
        await deleteImage(existing.imageUrl);
      } catch (err) {
        console.warn('Could not remove previous banner image:', err.message);
      }
    }
  }

  return await prisma.banner.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title.trim() }),
      ...(data.subtitle !== undefined && { subtitle: data.subtitle ? data.subtitle.trim() : null }),
      ...(data.linkUrl !== undefined && { linkUrl: data.linkUrl ? data.linkUrl.trim() : null }),
      ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
      ...(data.sortOrder !== undefined && { sortOrder: Number(data.sortOrder) }),
      imageUrl,
    },
  });
};

const deleteBanner = async (id) => {
  const existing = await prisma.banner.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error(`Banner with ID '${id}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  const deleted = await prisma.banner.delete({
    where: { id },
  });

  if (existing.imageUrl) {
    try {
      await deleteImage(existing.imageUrl);
    } catch (err) {
      console.warn('Could not remove banner image from storage:', err.message);
    }
  }

  return deleted;
};

module.exports = {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
