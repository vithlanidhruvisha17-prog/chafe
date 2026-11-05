const galleryService = require('../services/galleryService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getGallery = asyncHandler(async (req, res) => {
  const gallery = await galleryService.getActiveGallery();
  successResponse(res, 200, gallery, 'Active gallery images fetched successfully');
});

const getAllGallery = asyncHandler(async (req, res) => {
  const gallery = await galleryService.getAllGallery();
  successResponse(res, 200, gallery, 'All gallery images fetched successfully');
});

const createGallery = asyncHandler(async (req, res) => {
  const gallery = await galleryService.createGallery(req.body, req.file);
  successResponse(res, 201, gallery, 'Gallery image added successfully');
});

const updateGallery = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const gallery = await galleryService.updateGallery(id, req.body, req.file);
  successResponse(res, 200, gallery, 'Gallery image updated successfully');
});

const deleteGallery = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await galleryService.deleteGallery(id);
  successResponse(res, 200, deleted, 'Gallery image deleted successfully');
});

module.exports = {
  getGallery,
  getAllGallery,
  createGallery,
  updateGallery,
  deleteGallery,
};
