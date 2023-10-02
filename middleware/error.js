const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Server Error";

  //   wrong id mongodb error
  if (err.name === "CastError") {
    const message = `Resource not found with id invalid server path ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //   Duolicate key error
  if (err.code === 11000) {
    const message = `Duplicate key ${Object.keys(err.keyValue)} Entered`;
  }

  //wrong jwt error
  if (err.name === "JsonWebTokenError") {
    const message = `Invalid token`;
    err = new ErrorHandler(message, 400);
  }

  //   jwt expired
  if (err.name === "TokenExpiredError") {
    const message = `Expired token`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    status: false,
    message: err.message,
  });
};
