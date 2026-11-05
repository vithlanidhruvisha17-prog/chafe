const storageService = require('../services/storageService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error('Please provide an image file under form-data key "image".');
    error.statusCode = 400;
    throw error;
  }

  const folder = req.body.folder || 'menu';
  const result = await storageService.uploadImage(req.file, folder);

  successResponse(res, 201, result, 'Image uploaded successfully');
});

const deleteImage = asyncHandler(async (req, res) => {
  const { path } = req.body;
  const result = await storageService.deleteImage(path);

  successResponse(res, 200, result, 'Image deleted successfully');
});

module.exports = {
  uploadImage,
  deleteImage,
};
