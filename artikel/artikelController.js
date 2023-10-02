const express = require("express");
const path = require("path");
const router = express.Router();
const { upload } = require("../multer");
const fs = require("fs");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const { isAuthenticated } = require("../middleware/auth");
const userModel = require("../user/userModel");
const artikelModel = require("./artikelModel");
const { default: slugify } = require("slugify");
const { Query } = require("mongoose");
const categoryModel = require("../category/categoryModel");

router.post(
  "/create",
  // isAuthenticated,
  upload.array("images"),
  catchAsyncError(async (req, res, next) => {
    try {
      const authorId = req.body.authorId;
      const author = await userModel.findOne({ _id: authorId });
      if (!author) {
        return next(new ErrorHandler("Invalid author", 400));
      } else {
        const files = req.files;
        const imageUrl = files?.map((file) => `${file.filename}`);
        const title = req.body.title;
        const artikelData = req.body;
        artikelData.images = imageUrl;
        artikelData.author = author;
        artikelData.slug = slugify(title);
        artikelData.category = slugify(req.body.category).toLowerCase();

        const artikel = await artikelModel.create(artikelData);
        res.status(201).json({
          success: true,
          message: "Created artikel",
          artikel,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.delete(
  "/delete-artikel/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const deleteArtikel = await artikelModel.findOneAndDelete({
        _id: req.params.id,
      });
      res.status(200).json({
        success: true,
        message: "Artikel deleted",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.put(
  "/update-artikel/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, authorId, tags, isi, category } = req.body;

      const validateAuthor = await artikelModel.findOne({ _id: id });
      console.log(validateAuthor);
      if (validateAuthor.authorId.toString() !== authorId) {
        // console.log("author" + validateAuthor._id.toString());
        // console.log("author artikel" + authorId);
        return next(new ErrorHandler("Invalid Author", 400));
      }
      const authorObj = await userModel.findOne({ _id: authorId });
      if (!authorObj) {
        // If authorObj is null, handle the error
        return next(new ErrorHandler("Author not found", 400));
      }

      const updateArtikel = await artikelModel.findByIdAndUpdate(
        id,
        {
          title,
          tags,
          author: authorObj,
          slug: slugify(title),
          authorId,
          isi,
          category: slugify(category).toLowerCase(),
        },
        { new: true }
      );
      res.status(200).json({
        success: true,
        message: "Updated artikel",
        updateArtikel,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get(
  "/live-search",
  catchAsyncError(async (req, res, next) => {
    try {
      const { c } = req.query;
      const keys = ["title", "isi", "tags"];
      const search = (data) => {
        return data.filter((item) =>
          keys.some((key) => item[key].toLowerCase().includes(c))
        );
      };

      // const searchQuery = (data) => {
      //   const search = data.filter((item) => {
      //     const text = item[keys].toLowerCase();
      //     return text.includes(c.toLowerCase());
      //   });

      //   return search;
      // };
      let artikels = await artikelModel.find().sort({ createdAt: -1 });
      res.json(search(artikels));
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// router.put(
//   "/update-artikel/:id",
//   catchAsyncError(async (req, res, next) => {
//     try {
//       const { id } = req.params;
//       const authorId = req.body.authorId;

//       const validateAuthor = await artikelModel.findOne({ authorId: authorId });

//       if (!validateAuthor || validateAuthor.authorId.toString() !== authorId) {
//         console.log(
//           "author" + validateAuthor
//         );
//         console.log("author artikel" + authorId);
//         return next(new ErrorHandler("Invalid Author", 400));
//       }
//       const authorObj = await userModel.findOne({ _id: authorId });

//       if (!authorObj) {
//         // If authorObj is null, handle the error
//         return next(new ErrorHandler("Author not found", 400));
//       }

//       const title = req.body.title;
//       const author = authorObj;
//       const slug = slugify(title);
//       const tags = req.body.tags;
//       const isi = req.body.isi;
//       const category = req.body.category;

//       const updateArtikel = await artikelModel.findOneAndUpdate(
//         { _id: id },
//         {
//           title: title,
//           author: author,
//           category: category,
//           slug: slug,
//           tags: tags,
//           authorId: authorId,
//           isi: isi,
//         },
//         { new: true }
//       );
//       res.status(200).json({
//         success: true,
//         message: "Updated artikel",
//         updateArtikel,
//       });
//     } catch (error) {
//       return next(new ErrorHandler(error, 400));
//     }
//   })
// );

router.get(
  "/searching/:keyword",
  catchAsyncError(async (req, res, next) => {
    try {
      const { keyword } = req.params;
      const result = await artikelModel.find({
        title: { $regex: keyword, $options: "i" },
      });
      res.json(result);
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get(
  "/your-artikel/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const youArtikel = await artikelModel.find({ authorId: req.params.id });
      res.status(200).json({
        success: true,
        panjang: youArtikel.length,
        message: "Your artikel",
        youArtikel,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get(
  "/artikel/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const id = req.params.id;
      const artikel = await artikelModel.findById(id);
      res.status(200).json({
        success: true,
        artikel,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get(
  "/populer",
  catchAsyncError(async (req, res, next) => {
    try {
      const populer = await artikelModel.find().sort({ views: -1 }).limit(10);
      res.status(201).json({
        populer,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

router.get(
  "/terbaru",
  catchAsyncError(async (req, res, next) => {
    try {
      const terbaru = await artikelModel
        .find()
        .sort({ createdAt: -1 })
        .limit(4);
      res.status(201).json({
        terbaru,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

router.get(
  "/all-artikel/",
  catchAsyncError(async (req, res, next) => {
    try {
      let page = req.query.page || 1;
      let limit = req.query.limit;
      let search = req.query.search || "";

      const allCat = categoryModel.find();
      const allCategory = [];
      (await allCat).forEach((cat) => {
        allCategory.push(cat.slug);
      });

      const skip = (page - 1) * 3;

      const allArtikel = await artikelModel
        .find({ title: { $regex: search, $options: "i" } })
        .skip(skip)
        .limit(limit);

      res.status(201).json({
        panjang: allArtikel.length,
        allArtikel,
        page,
        limit,
        search,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

router.put(
  "/count-views/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const { views } = req.body;
      const addviews = await artikelModel.findOneAndUpdate(
        { _id: req.params.id },
        { views },
        {
          new: true,
        }
      );
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

// by category & related product
router.get(
  "/related-category/",
  catchAsyncError(async (req, res, next) => {
    try {
      const Category = await artikelModel
        .find({ category: req.query.category })
        .limit(5);
      res.status(200).json({
        Category,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

router.get(
  "/category/",
  catchAsyncError(async (req, res, next) => {
    try {
      let page = req.query.page;
      let limit = req.query.limit;

      const skip = (page - 1) * 3;
      const Category = await artikelModel
        .find({ category: req.query.category })
        .limit(limit)
        .skip(skip);
      res.status(200).json({
        Category,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

module.exports = router;
