const AppError = require("../errors/AppError");

// validate(schema)        -> on error, passes a 400 error to the error handler
// validate(schema, view)  -> on error, shows the form again with the error message
function validate(schema, view) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: true,
      errors: { wrap: { label: false } },
    });
    if (error) {
      const message = error.details[0].message;
      if (view) return res.status(400).render(view, { error: message, form: req.body });
      return next(new AppError(message, 400));
    }
    req.body = value; // cleaned values (trimmed, lowercased, converted to numbers)
    next();
  };
}

module.exports = { validate };
