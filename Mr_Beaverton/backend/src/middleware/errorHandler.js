// Error handling middleware
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  console.error('Request body:', req.body);
  console.error('Request headers:', req.headers);
  console.error('Stack trace:', err.stack);

  // Default error status and message
  let statusCode = 500;
  let message = 'Sunucu hatası';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Yetkilendirme hatası';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Erişim reddedildi';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Kaynak bulunamadı';
  }

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message,
    details: err.message,
    path: req.path,
    method: req.method,
    body: req.body,
    stack: err.stack
  });
}

// Not found middleware
function notFound(req, res, next) {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.name = 'NotFoundError';
  next(error);
}

module.exports = { errorHandler, notFound };
