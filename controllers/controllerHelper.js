const { body, validationResult } = require("express-validator");

exports.bodyRequired = (field, fieldName) =>
  body(field).trim().notEmpty().escape().withMessage(`${fieldName} must be specified`);

exports.catchValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      fields: req.body,
      message: "Invalid request, check errors",
      errors: errors.array(),
    });
  }
  
  return next();
};
