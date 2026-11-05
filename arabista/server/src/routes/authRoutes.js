const express = require('express');
const authController = require('../controllers/authController');
const { protectAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginSchema } = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.get('/me', protectAdmin, authController.getMe);

module.exports = router;
