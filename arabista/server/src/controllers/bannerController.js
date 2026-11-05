const bannerService = require('../services/bannerService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getBanners = asyncHandler(async (req, res) => {
  const banners = await bannerService.getActiveBanners();
  successResponse(res, 200, banners, 'Active banners fetched successfully');
});

const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await bannerService.getAllBanners();
  successResponse(res, 200, banners, 'All banners fetched successfully');
});

const createBanner = asyncHandler(async (req, res) => {
  const banner = await bannerService.createBanner(req.body, req.file);
  successResponse(res, 201, banner, 'Banner created successfully');
});

const updateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const banner = await bannerService.updateBanner(id, req.body, req.file);
  successResponse(res, 200, banner, 'Banner updated successfully');
});

const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await bannerService.deleteBanner(id);
  successResponse(res, 200, deleted, 'Banner deleted successfully');
});

module.exports = {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
