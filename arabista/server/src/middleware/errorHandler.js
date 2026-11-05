const multer = require('multer');

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
};

const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'File size exceeds 5MB limit.',
      });
    }
    return res.status(400).json({
      success: false,
      data: null,
      message: `File upload error: ${err.message}`,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid authentication token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Authentication token has expired.',
    });
  }

  if (err.code === 'P2002') {
    const fields = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return res.status(409).json({
      success: false,
      data: null,
      message: `A record with this ${fields} already exists.`,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      data: null,
      message: 'Record not found.',
    });
  }

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    data: null,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
