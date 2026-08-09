const { validationResult } = require('express-validator');

/**
 * Runs an express-validator chain and returns 400 with field-level errors on failure.
 * Usage: router.post('/route', validate([ body('email').isEmail(), ... ]), controller)
 * @param {Array} validations - array of express-validator checks
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((v) => v.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formatted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formatted,
    });
  };
};

module.exports = validate;
