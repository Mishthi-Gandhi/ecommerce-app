const multer = require("multer");
const AppError = require("../errors/AppError");

function notFound(req, res, next) {
  next(new AppError("Page not found", 404));
}

function globalErrorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  } else if (err.name === "ValidationError") {
    status = 400;
  } else if (err.code === 11000) {
    status = 409;
    message = "A record with this value already exists";
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "Image is too large (max 5 MB)" : err.message;
  }

  if (status >= 500) {
    console.error(err);
    if (process.env.NODE_ENV === "production") message = "Something went wrong";
  }

  const wantsJson = req.originalUrl.startsWith("/api") || req.accepts(["html", "json"]) === "json";
  if (wantsJson) {
    return res.status(status).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
  return res.status(status).render("error", { status, message });
}

module.exports = { notFound, globalErrorHandler };
