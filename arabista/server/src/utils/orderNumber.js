const crypto = require('crypto');

/**
 * Generates a human-readable order number formatted as ARB-XXXXX
 * Example: ARB-8492
 */
const generateOrderNumber = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `ARB-${randomDigits}`;
};

module.exports = {
  generateOrderNumber,
};
