// middleware/error.js

const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the stack trace for debugging

  // Respond with an error message and status code
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : null, // Show stack trace in development only
  });
};

module.exports = errorHandler;
