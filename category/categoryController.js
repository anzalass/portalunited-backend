const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const { isAuthenticated } = require("../middleware/auth");
const categoryModel = require("./categoryModel");
const { response } = require("../app");
const slugify = require("slugify");

router.post(
  "/create",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const { name } = req.body;

      const existingCategory = await categoryModel.findOne({ name: name });
      if (existingCategory) {
        return next(new ErrorHandler("Category already exists", 400));
      }

      const category = await categoryModel.create({
        name,
        slug: slugify(name),
      });
      category.save();
      res.status(201).json({
        success: true,
        message: "successfully created",
        category,
      });
    } catch (error) {
      return next(new ErrorHandler(error.response.message, 500));
    }
  })
);

router.put(
  "/update/:id",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const { name } = req.body;
      const category = await categoryModel.findOneAndUpdate(
        { _id: req.params.id },
        {
          name,
          slug: slugify(name),
        },
        { new: true }
      );
      res.status(201).json({
        success: true,
        message: "successfully updated category",
        category,
      });
    } catch (error) {
      return next(new ErrorHandler(error.response.message, 500));
    }
  })
);

router.delete(
  "/delete/:id",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      const category = await categoryModel.findByIdAndDelete(req.params.id);
      res.status(201).json({
        success: true,
        message: "successfully delete category",
        category,
      });
    } catch (error) {
      return next(new ErrorHandler(error.response.message, 500));
    }
  })
);

router.get(
  "/",
  catchAsyncError(async (req, res, next) => {
    try {
      const category = await categoryModel.find();
      res.status(201).json({
        success: true,
        panjang: category.length,
        message: "successfully get category",
        category,
      });
    } catch (error) {
      return next(new ErrorHandler(error.response.message, 500));
    }
  })
);

router.get(
  "/getbyid/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const category = await categoryModel.findOne({ _id: req.params.id });
      res.status(201).json({
        success: true,
        message: "successfully get category",
        category,
      });
    } catch (error) {
      return next(new ErrorHandler(error.response.message, 500));
    }
  })
);

module.exports = router;
