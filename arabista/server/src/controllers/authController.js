const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginAdmin(email, password);

  successResponse(
    res,
    200,
    {
      token: result.token,
      admin: result.admin,
    },
    'Authentication successful'
  );
});

const getMe = asyncHandler(async (req, res) => {
  successResponse(res, 200, req.admin, 'Admin profile retrieved successfully');
});

module.exports = {
  login,
  getMe,
};
