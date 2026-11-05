const express = require('express');
const authRoutes = require('./authRoutes');
const uploadRoutes = require('./uploadRoutes');
const healthRoutes = require('./healthRoutes');
const categoryRoutes = require('./categoryRoutes');
const subCategoryRoutes = require('./subCategoryRoutes');
const menuItemRoutes = require('./menuItemRoutes');
const bannerRoutes = require('./bannerRoutes');
const galleryRoutes = require('./galleryRoutes');
const orderRoutes = require('./orderRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/health', healthRoutes);
router.use('/categories', categoryRoutes);
router.use('/subcategories', subCategoryRoutes);
router.use('/menu-items', menuItemRoutes);
router.use('/banners', bannerRoutes);
router.use('/gallery', galleryRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
