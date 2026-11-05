const menuItemService = require('../services/menuItemService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getMenuItems = asyncHandler(async (req, res) => {
  const { search, category, available } = req.query;
  const items = await menuItemService.getMenuItems({ search, category, available });
  successResponse(res, 200, items, 'Menu items fetched successfully');
});

const getSignatureItems = asyncHandler(async (req, res) => {
  const items = await menuItemService.getSignatureItems();
  successResponse(res, 200, items, 'Signature menu items fetched successfully');
});

const getMenuItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await menuItemService.getMenuItemById(id);
  successResponse(res, 200, item, 'Menu item fetched successfully');
});

const createMenuItem = asyncHandler(async (req, res) => {
  const item = await menuItemService.createMenuItem(req.body, req.file);
  successResponse(res, 201, item, 'Menu item created successfully');
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await menuItemService.updateMenuItem(id, req.body, req.file);
  successResponse(res, 200, item, 'Menu item updated successfully');
});

const toggleAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await menuItemService.toggleAvailability(id);
  successResponse(
    res,
    200,
    item,
    `Menu item marked as ${item.isAvailable ? 'available' : 'unavailable'}`
  );
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await menuItemService.deleteMenuItem(id);
  successResponse(res, 200, deleted, 'Menu item deleted successfully');
});

module.exports = {
  getMenuItems,
  getSignatureItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
};
