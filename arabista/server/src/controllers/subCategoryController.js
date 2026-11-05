const subCategoryService = require('../services/subCategoryService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const getAllSubCategories = asyncHandler(async (req, res) => {
  const { categoryId } = req.query;
  const subCategories = await subCategoryService.getAllSubCategories(categoryId);
  successResponse(res, 200, subCategories, 'Subcategories fetched successfully');
});

const getSubCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const subCategory = await subCategoryService.getSubCategoryBySlug(slug);
  successResponse(res, 200, subCategory, 'Subcategory fetched successfully');
});

const createSubCategory = asyncHandler(async (req, res) => {
  const subCategory = await subCategoryService.createSubCategory(req.body, req.file);
  successResponse(res, 201, subCategory, 'Subcategory created successfully');
});

const updateSubCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subCategory = await subCategoryService.updateSubCategory(id, req.body, req.file);
  successResponse(res, 200, subCategory, 'Subcategory updated successfully');
});

const deleteSubCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await subCategoryService.deleteSubCategory(id);
  successResponse(res, 200, deleted, 'Subcategory deleted successfully');
});

module.exports = {
  getAllSubCategories,
  getSubCategoryBySlug,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
};
