const express = require("express");
const router = express.Router();
const ErrorHandler = require("../../utils/ErrorHandler");
const catchAsyncError = require("../../middleware/catchAsyncError");
const userModel = require("../user/userModel");
const imageArtikelModel = require("./imagesArtikelModel");
const artikelModel = require("./artikelModel");
const { default: slugify } = require("slugify");
const categoryModel = require("../category/categoryModel");
const uploads = require("../../multer");
const ImageKit = require("imagekit");

const ImagekitConfig = require("../../utils/imageKit");
const savedModel = require("../saved/savedModel");

router.post(
  "/create",
  uploads.array("images"),
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

router.post(
  "/create1",
  catchAsyncError(async (req, res, next) => {
    try {
      const authorId = req.body.authorId;
      const author = await userModel.findOne({ _id: authorId });
      if (!author) {
        res.status(400).json({
          message: "Invalid author",
        });
      } else {
        const artikelData = req.body;
        artikelData.slug = slugify(req.body.title);
        artikelData.author = author;
        artikelData.category = slugify(req.body.category).toLowerCase();

        const CreateArtikel = await artikelModel.create(artikelData);
        res.status(201).json({
          success: true,
          message: "success",
          CreateArtikel,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error,
        success: false,
      });
    }
  })
);

router.post(
  "/images",
  uploads.array("images"),
  catchAsyncError(async (req, res, next) => {
    try {
      const url = [];
      const idimg = [];
      let result;
      const files = req.files;
      for (const file of files) {
        const newPath = await ImagekitConfig.upload({
          folder: "blog-mu/artikel-img",
          file: file.buffer,
          fileName: file.originalname,
        });
        url.push(newPath.url);
        idimg.push(newPath.fileId);
      }

      for (let i = 0; i < url.length; i++) {
        let InsertImage = await imageArtikelModel.create({
          id_artikel: req.body.idartikel,
          image: url[i],
          imageId: idimg[i],
        });
        InsertImage = result;
      }

      res.status(200).json({
        result,
        message: "success",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    }
  })
);

router.get(
  "/images/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const image = await imageArtikelModel.findOne({
        id_artikel: req.params.id,
      });
      res.status(200).json({
        message: "success",
        image,
      });
    } catch (error) {
      res.status(500).json({
        message: error,
      });
    }
  })
);
router.get(
  "/allimages/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const image = await imageArtikelModel.find({
        id_artikel: req.params.id,
      });
      res.status(200).json({
        message: "success",
        image,
      });
    } catch (error) {
      res.status(500).json({
        message: error,
      });
    }
  })
);

router.get(
  "/artikel/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const artikel = await artikelModel.findById(req.params.id);
      const images = await imageArtikelModel
        .find({
          id_artikel: req.params.id,
        })
        .select("-_id")
        .select("-createdAt")
        .select("-updatedAt");

      const getRecomendations = await artikelModel
        .find({ category: artikel.category })
        .limit(5);

      res.status(200).json({
        message: "success",
        artikel,
        getRecomendations,
        images,
      });
    } catch (error) {
      res.status(500).json({
        message: error,
      });
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

      if (validateAuthor.authorId.toString() !== authorId) {
        return next(new ErrorHandler("Invalid Author", 400));
      }
      const authorObj = await userModel.findOne({ _id: authorId });
      if (!authorObj) {
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

      let artikels = await artikelModel.find().sort({ createdAt: -1 });
      res.json(search(artikels));
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

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
  "/your-profile/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const youArtikel = await artikelModel.find({ authorId: req.params.id });
      const getSave = await savedModel.find({ savedBy: req.params.id });
      res.status(200).json({
        message: "get saved",
        success: true,
        panjangSave: getSave.length,
        panjangArtikel: youArtikel.length,
        getSave,
        youArtikel,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get(
  "/detail-artikel-page/:id/",
  catchAsyncError(async (req, res, next) => {
    try {
      const id = req.params.id;
      const { category } = req.query;
      const artikel = await artikelModel.findById(id);
      const artikelRecomendations = await artikelModel
        .find({
          category: category,
        })
        .limit(5);
      res.status(200).json({
        message: "success",
        artikel,
        artikelRecomendations,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

router.get(
  "/homepage",
  catchAsyncError(async (req, res, next) => {
    try {
      const populer = await artikelModel
        .find()
        .sort({ views: -1 })
        .limit(5)
        .select("-isi");

      const terbaru = await artikelModel
        .find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("-isi");

      const artikelhomepage = await artikelModel
        .find()
        .limit(10)
        .select("-isi");

      res.status(201).json({
        populer,
        terbaru,
        artikelhomepage,
        message: "success",
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

      const skip = (page - 1) * 10;

      const allArtikel = await artikelModel
        .find({ title: { $regex: search, $options: "i" } })
        .skip(skip)
        .limit(10);

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
      let page = req.query.page || 1;
      const skip = (page - 1) * 10;

      const Category = await artikelModel
        .find({ category: req.query.category })
        .limit(10)
        .skip(skip);
      res.status(200).json({
        Category,
        panjang: Category.length,
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
