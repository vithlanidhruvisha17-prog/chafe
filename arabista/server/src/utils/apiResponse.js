const successResponse = (res, statusCode = 200, data = null, message = 'Success') => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

const errorResponse = (res, statusCode = 500, message = 'An error occurred', details = null) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    ...(details && { details }),
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
