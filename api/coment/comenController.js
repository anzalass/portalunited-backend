const express = require("express");
const router = express.Router();
const ErrorHandler = require("../../utils/ErrorHandler");
const catchAsyncError = require("../../middleware/catchAsyncError");
const { isAuthenticated } = require("../../middleware/auth");
const comenModel = require("./comenModel");

router.post(
  "/post-comen",
  catchAsyncError(async (req, res, next) => {
    try {
      const { idArtikel, namaUser, idUser, isi } = req.body;
      const PostComen = await comenModel.create({
        idArtikel,
        namaUser,
        idUser,
        isi,
      });
      res.status(200).json({
        success: true,
        message: "Created",
        PostComen,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

router.get(
  "/get-comen/:idArtikel",
  catchAsyncError(async (req, res, next) => {
    try {
      const getComen = await comenModel.find({
        idArtikel: req.params.idArtikel,
      });
      res.status(200).json({
        getComen,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

module.exports = router;
