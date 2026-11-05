const asyncHandler = require('../utils/asyncHandler');

const getHealth = asyncHandler(async (req, res) => {
  const payload = {
    status: 'ok',
    cafe: 'ARABISTA',
    location: 'Surat, Gujarat',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };

  res.status(200).json({
    success: true,
    data: payload,
    message: 'Server is healthy',
    status: 'ok',
    cafe: 'ARABISTA',
    location: 'Surat, Gujarat',
  });
});

module.exports = {
  getHealth,
};
