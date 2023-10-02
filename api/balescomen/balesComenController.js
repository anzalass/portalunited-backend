const express = require("express");
const router = express.Router();
const ErrorHandler = require("../../utils/ErrorHandler");
const catchAsyncError = require("../../middleware/catchAsyncError");
const { isAuthenticated } = require("../../middleware/auth");
const balesComenModel = require("./balesComenModel");

router.post(
  "/post-bales-comen",
  catchAsyncError(async (req, res, next) => {
    try {
      const { idArtikel, namaUser, parentComen, idUser, isi } = req.body;
      const PostBalesComen = await balesComenModel.create({
        idArtikel,
        parentComen,
        namaUser,
        idUser,
        isi,
      });
      res.status(200).json({
        success: true,
        message: "Created",
        PostBalesComen,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

router.get(
  "/get-bales-comen/",
  catchAsyncError(async (req, res, next) => {
    try {
      const { q } = req.query;
      const balesComent = await balesComenModel.find({
        parentComen: q,
      });
      res.status(200).json({
        success: true,
        balesComent,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

module.exports = router;
