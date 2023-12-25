const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter your name!"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email address"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [6, "Password should be greater than 6 characters"],
      select: false,
    },
    avatar: {
      type: String,
      required: true,
    },
    avatarId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true }
);

userModel.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userModel.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_TOKEN, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

userModel.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userModel);
