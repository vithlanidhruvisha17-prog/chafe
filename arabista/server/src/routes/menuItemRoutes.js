const express = require('express');
const menuItemController = require('../controllers/menuItemController');
const { protectAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { createMenuItemSchema, updateMenuItemSchema } = require('../utils/validators');

const router = express.Router();

// Public routes
router.get('/', menuItemController.getMenuItems);
router.get('/signature', menuItemController.getSignatureItems);
router.get('/:id', menuItemController.getMenuItemById);

// Admin routes
router.post(
  '/',
  protectAdmin,
  upload.single('image'),
  validate(createMenuItemSchema),
  menuItemController.createMenuItem
);

router.put(
  '/:id',
  protectAdmin,
  upload.single('image'),
  validate(updateMenuItemSchema),
  menuItemController.updateMenuItem
);

router.patch(
  '/:id/toggle-availability',
  protectAdmin,
  menuItemController.toggleAvailability
);

router.delete(
  '/:id',
  protectAdmin,
  menuItemController.deleteMenuItem
);

module.exports = router;
