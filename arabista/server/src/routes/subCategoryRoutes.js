const express = require('express');
const subCategoryController = require('../controllers/subCategoryController');
const { protectAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { createSubCategorySchema, updateSubCategorySchema } = require('../utils/validators');

const router = express.Router();

// Public routes
router.get('/', subCategoryController.getAllSubCategories);
router.get('/:slug', subCategoryController.getSubCategoryBySlug);

// Admin routes
router.post(
  '/',
  protectAdmin,
  upload.single('image'),
  validate(createSubCategorySchema),
  subCategoryController.createSubCategory
);

router.put(
  '/:id',
  protectAdmin,
  upload.single('image'),
  validate(updateSubCategorySchema),
  subCategoryController.updateSubCategory
);

router.delete(
  '/:id',
  protectAdmin,
  subCategoryController.deleteSubCategory
);

module.exports = router;
