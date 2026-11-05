const express = require('express');
const { protectAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const {
  createCategorySchema,
  updateCategorySchema,
  createSubCategorySchema,
  updateSubCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  createBannerSchema,
  updateBannerSchema,
  createGallerySchema,
  updateGallerySchema,
  updateOrderStatusSchema,
} = require('../utils/validators');

const categoryController = require('../controllers/categoryController');
const subCategoryController = require('../controllers/subCategoryController');
const menuItemController = require('../controllers/menuItemController');
const bannerController = require('../controllers/bannerController');
const galleryController = require('../controllers/galleryController');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Require admin authentication for all routes mounted under /api/admin
router.use(protectAdmin);

// Admin Category Routes
router.get('/categories', categoryController.getAllCategories);
router.post('/categories', upload.single('image'), validate(createCategorySchema), categoryController.createCategory);
router.put('/categories/:id', upload.single('image'), validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Admin SubCategory Routes
router.get('/subcategories', subCategoryController.getAllSubCategories);
router.post('/subcategories', upload.single('image'), validate(createSubCategorySchema), subCategoryController.createSubCategory);
router.put('/subcategories/:id', upload.single('image'), validate(updateSubCategorySchema), subCategoryController.updateSubCategory);
router.delete('/subcategories/:id', subCategoryController.deleteSubCategory);

// Admin MenuItem Routes
router.get('/menu-items', menuItemController.getMenuItems);
router.post('/menu-items', upload.single('image'), validate(createMenuItemSchema), menuItemController.createMenuItem);
router.put('/menu-items/:id', upload.single('image'), validate(updateMenuItemSchema), menuItemController.updateMenuItem);
router.patch('/menu-items/:id/toggle-availability', menuItemController.toggleAvailability);
router.delete('/menu-items/:id', menuItemController.deleteMenuItem);

// Admin Banner Routes
router.get('/banners', bannerController.getAllBanners);
router.post('/banners', upload.single('image'), validate(createBannerSchema), bannerController.createBanner);
router.put('/banners/:id', upload.single('image'), validate(updateBannerSchema), bannerController.updateBanner);
router.delete('/banners/:id', bannerController.deleteBanner);

// Admin Gallery Routes
router.get('/gallery', galleryController.getAllGallery);
router.post('/gallery', upload.single('image'), validate(createGallerySchema), galleryController.createGallery);
router.put('/gallery/:id', upload.single('image'), validate(updateGallerySchema), galleryController.updateGallery);
router.delete('/gallery/:id', galleryController.deleteGallery);

// Admin Order Routes
router.get('/orders', orderController.getAdminOrders);
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), orderController.updateOrderStatus);

// Admin Stats
router.get('/stats', orderController.getAdminStats);

module.exports = router;
