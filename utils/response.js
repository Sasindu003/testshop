/**
 * Standard API response envelope.
 */
const sendSuccess = (res, data = null, message = 'ok', statusCode = 200) => {
  res.status(statusCode).json({ success: true, data, message });
};

const sendError = (res, message = 'Server error', statusCode = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  res.status(statusCode).json(body);
};

/**
 * Create an error with a status code for the centralized error handler.
 */
const createError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = { sendSuccess, sendError, createError };
