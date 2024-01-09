const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const ErrorHandler = require("../../utils/ErrorHandler");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("../../middleware/catchAsyncError");
const userModel = require("./userModel");
const sendToken = require("../../utils/jwtToken");
const { isAuthenticated } = require("../../middleware/auth");
const sendMail = require("../../utils/sendMail");
const bcrypt = require("bcrypt");
const uploads = require("../../multer");
const ImagekitConfig = require("../../utils/imageKit");

router.post("/register", uploads.single("file"), async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const foto = req.file;
    const userEmail = await userModel.findOne({ email: email });
    if (userEmail) {
      res.status(400).json({
        message: "User already exist",
      });
    }
    let avatarurl;
    let avatarId;
    const avatar = await ImagekitConfig.upload({
      file: foto.buffer,
      folder: "blog-mu/profile-img",
      fileName: foto.originalname,
    });
    avatarurl = avatar.url;
    avatarId = avatar.fileId;
    const user = {
      username: username,
      email: email,
      password: password,
      avatar: avatarurl,
      avatarId: avatarId,
    };
    const newUser = await userModel.create(user);
    res.status(201).json({
      status: true,
      msg: "Success",
      data: newUser,
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
        sameSite: 'None', // Adjust based on your requirements and SSL setup
        secure: true,     // Make sure to set this to true if using HTTPS
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
      const email = req.body.email;

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
      } catch (error) {
        res.status(500).json({ error: error });
      }
      res.status(200).json({
        success: true,
        message: "Please Cek Your Email to Reset Password",
      });
    } catch (error) {
      res.status(500).json({ error: error });
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

router.put(
  "/edit-user/:id",
  catchAsyncError(async (req, res, next) => {
    const newData = req.body;

    const finduser = await userModel.findById(req.params.id);
    if (!finduser) {
      res.status(404).json({
        message: "user not found",
      });
    }
    const hashed = await bcrypt.hash(newData.password, 10);
    const user = await userModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        username: newData.username,
        email: newData.email,
        password: hashed,
      },
      { new: true }
    );

    res.status(201).json({
      message: "success",
      user,
    });
  })
);

router.put(
  "/edit-avatar/:id",
  uploads.single("file"),
  catchAsyncError(async (req, res, next) => {
    try {
      const avatar = req.file;
      const finduser = await userModel.findById(req.params.id);
      if (!finduser) {
        res.status(404).json({
          message: "User not found",
        });
      }

      const getAvatarMetaData = await ImagekitConfig.getFileMetadata(
        finduser.avatar,
        function (error, result) {
          if (error) console.log(error);
          else console.log(result);
        }
      );

      // const deleteavatar = await ImagekitConfig.deleteFile(
      //   getAvatarMetaData.fileId,
      //   function (err, res) {
      //     if (err) {
      //       console.log(err);
      //     }
      //   }
      // );
      const newAvatar = await ImagekitConfig.upload({
        file: avatar.buffer,
        folder: "blog-mu/profile-img",
        fileName: avatar.originalname,
      });
      const updateAvatar = await userModel.findOneAndUpdate(
        { _id: req.params.id },
        {
          avatar: newAvatar.url,
        },
        { new: true }
      );
      console.log(newAvatar.fileId);
      res.status(201).json({
        status: true,
        msg: "Success",
        data: updateAvatar,
      });
    } catch (error) {
      console.log(error);
    }
  })
);

module.exports = router;
