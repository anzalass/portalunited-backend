const express = require("express");
const router = express.Router();
const ErrorHandler = require("../../utils/ErrorHandler");
const catchAsyncError = require("../../middleware/catchAsyncError");
const { isAuthenticated } = require("../../middleware/auth");
const savedModel = require("./savedModel");

router.post(
  "/save-artikel",
  catchAsyncError(async (req, res, next) => {
    try {
      const { title, images, artikelId, savedBy } = req.body;

      const validation = await savedModel.findOne({
        artikelId: artikelId,
        savedBy: savedBy,
      });

      if (validation) {
        return next(new ErrorHandler("Telah disimpan", 500));
      }
      const saveArtikel = await savedModel.create({
        title,
        images,
        artikelId,
        savedBy,
      });
      res.status(200).json({
        success: true,
        saveArtikel,
        message: "Artikel saved",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

router.delete(
  "/delete-save-artikel",
  catchAsyncError(async (req, res, next) => {
    try {
      const validation = await savedModel.findOne({
        artikelId: req.body.artikelId,
        savedBy: req.body.savedBy,
      });
      if (validation) {
        const deleteSaved = await savedModel.findOneAndDelete({
          artikelId: req.body.artikelId,
          savedBy: req.body.savedBy,
        });
        res.status(200).json({
          message: "delete saved",
          deleteSaved,
        });
      } else {
        return next(new ErrorHandler("gagal menghapus", 500));
      }
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

router.get(
  "/cek-save",
  catchAsyncError(async (req, res, next) => {
    try {
      const { artikelId, savedBy } = req.query;
      const validate = await savedModel.findOne({
        artikelId: artikelId,
        savedBy: savedBy,
      });
      res.status(200).send({
        disimpan: validate ? true : false,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

router.get(
  "/get-save/:id",
  catchAsyncError(async (req, res, next) => {
    try {
      const getSave = await savedModel.find({ savedBy: req.params.id });
      res.status(200).json({
        message: "get saved",
        success: true,
        panjang: getSave.length,
        getSave,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 500));
    }
  })
);

module.exports = router;
