const express = require('express');
const galleryController = require('../controllers/galleryController');
const { protectAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { createGallerySchema, updateGallerySchema } = require('../utils/validators');

const router = express.Router();

// Public routes
router.get('/', galleryController.getGallery);

// Admin routes
router.get('/all', protectAdmin, galleryController.getAllGallery);

router.post(
  '/',
  protectAdmin,
  upload.single('image'),
  validate(createGallerySchema),
  galleryController.createGallery
);

router.put(
  '/:id',
  protectAdmin,
  upload.single('image'),
  validate(updateGallerySchema),
  galleryController.updateGallery
);

router.delete(
  '/:id',
  protectAdmin,
  galleryController.deleteGallery
);

module.exports = router;
