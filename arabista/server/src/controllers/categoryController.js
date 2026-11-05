const categoryService = require('../services/categoryService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  successResponse(res, 200, categories, 'Categories fetched successfully');
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = await categoryService.getCategoryBySlug(slug);
  successResponse(res, 200, category, 'Category fetched successfully');
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body, req.file);
  successResponse(res, 201, category, 'Category created successfully');
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await categoryService.updateCategory(id, req.body, req.file);
  successResponse(res, 200, category, 'Category updated successfully');
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await categoryService.deleteCategory(id);
  successResponse(res, 200, deleted, 'Category deleted successfully');
});

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
