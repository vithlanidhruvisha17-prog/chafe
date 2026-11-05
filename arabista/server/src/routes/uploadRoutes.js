const express = require('express');
const uploadController = require('../controllers/uploadController');
const { protectAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { deleteImageSchema } = require('../utils/validators');

const router = express.Router();

router.post('/', protectAdmin, upload.single('image'), uploadController.uploadImage);
router.delete('/', protectAdmin, validate(deleteImageSchema), uploadController.deleteImage);

module.exports = router;
