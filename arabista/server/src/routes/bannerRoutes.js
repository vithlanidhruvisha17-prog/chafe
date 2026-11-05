const express = require('express');
const bannerController = require('../controllers/bannerController');
const { protectAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { createBannerSchema, updateBannerSchema } = require('../utils/validators');

const router = express.Router();

// Public routes
router.get('/', bannerController.getBanners);

// Admin routes
router.get('/all', protectAdmin, bannerController.getAllBanners);

router.post(
  '/',
  protectAdmin,
  upload.single('image'),
  validate(createBannerSchema),
  bannerController.createBanner
);

router.put(
  '/:id',
  protectAdmin,
  upload.single('image'),
  validate(updateBannerSchema),
  bannerController.updateBanner
);

router.delete(
  '/:id',
  protectAdmin,
  bannerController.deleteBanner
);

module.exports = router;
