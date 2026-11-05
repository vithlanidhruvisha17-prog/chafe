const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protectAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { createCategorySchema, updateCategorySchema } = require('../utils/validators');

const router = express.Router();

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Admin routes
router.post(
  '/',
  protectAdmin,
  upload.single('image'),
  validate(createCategorySchema),
  categoryController.createCategory
);

router.put(
  '/:id',
  protectAdmin,
  upload.single('image'),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  protectAdmin,
  categoryController.deleteCategory
);

module.exports = router;
