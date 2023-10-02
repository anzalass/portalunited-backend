const express = require("express");
const path = require("path");
const router = express.Router();
const { upload } = require("../multer");
const fs = require("fs");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("../middleware/catchAsyncError");
const userModel = require("./userModel");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated } = require("../middleware/auth");
const sendMail = require("../utils/sendMail");
const bcrypt = require("bcrypt");

router.post("/register", upload.single("file"), async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const userEmail = await userModel.findOne({ email: email });
    if (userEmail) {
      const filename = req.file.filename;
      const filepath = `uploads/${filename}`;
      fs.unlink(filepath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ msg: "error deleting uploaded file" });
        }
      });
      return next(new ErrorHandler("user already exist", 400));
    }
    const filename = req.file.filename;
    const fileUrl = path.join(filename);

    const user = {
      username: username,
      email: email,
      password: password,
      avatar: fileUrl,
    };
    const newUser = userModel.create(user);
    res.status(200).json({
      newUser,
      status: true,
      msg: "Success",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

router.post(
  "/login",
  catchAsyncError(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ErrorHandler("Please provide email and password", 400));
      }
      const user = await userModel.findOne({ email }).select("+password");
      if (!user) {
        return next(
          new ErrorHandler("User doesnt Exist or User Not Activated", 400)
        );
      }
      const isComparePassword = await user.comparePassword(password);
      if (!isComparePassword) {
        return next(new ErrorHandler("Invalid Password", 400));
      }

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const user = await userModel.findById(req.user.id);
      console.log(user, "user con get");
      if (!user) {
        return next(new ErrorHandler("Please provide email and password", 400));
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler("Please provide email and password", 400));
    }
  })
);

router.get(
  "/logout",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      res.cookie("token_blog", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      res.status(201).json({
        success: true,
        message: "Logout was successful",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

const createTokenEditPassword = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

router.post(
  "/forgot-password",
  catchAsyncError(async (req, res, next) => {
    try {
      const { email } = req.body;

      const vaildateEmail = await userModel.findOne({ email: email });
      if (!vaildateEmail) {
        return next(new ErrorHandler("Email not registered", 500));
      }

      const user = {
        email: email,
      };

      const forgotPassword = createTokenEditPassword(user);
      const resetPassword = `http://localhost:5173/reset/?token=${forgotPassword}`;

      try {
        await sendMail({
          email: email,
          subject: "Reset Password",
          html: `<h1>Token Will Be expired in 5 minute</h1> <br> <h3>Please click on the link to reset your password</h3>  <br> <button><a href='${resetPassword}'>Klik Disini</a></button> `,
        });
        res.status(200).json({
          success: true,
          message: "Please Cek Your Email to Reset Password",
        });
      } catch (error) {
        res.status(500).json({ error: "error" });
        return next(new ErrorHandler(error, 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.put(
  "/reset-password",
  catchAsyncError(async (req, res, next) => {
    try {
      const { token, password } = req.body;

      const userReset = jwt.verify(token, process.env.ACTIVATION_SECRET);

      if (!userReset) {
        return next(new ErrorHandler("Invalid Token", 400));
      }

      const hashed = await bcrypt.hash(password, 10);

      const { email } = userReset;
      const Reset = await userModel.findOneAndUpdate(
        { email: email },
        {
          password: hashed,
        },
        { new: true }
      );
      res.status(200).json({
        Reset,
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

module.exports = router;
