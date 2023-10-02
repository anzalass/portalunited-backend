const userModel = require("../user/userModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token_blog } = req.cookies;
  if (!token_blog) {
    return next(new ErrorHandler("Login to Continue", 400));
  }
  const decoded = jwt.verify(token_blog, process.env.JWT_TOKEN);
  req.user = await userModel.findById(decoded.id);
  next();
});
