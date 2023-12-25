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
      res.status(500).json({
        error: error,
      });
    }
  })
);
router.post(
  "/reply-comen",
  catchAsyncError(async (req, res, next) => {
    try {
      const { idArtikel, namaUser, idUser, isi, parentComen } = req.body;
      const PostComen = await comenModel.create({
        idArtikel,
        namaUser,
        idUser,
        isi,
        parentComen,
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
  "/comen/:idArtikel",
  catchAsyncError(async (req, res, next) => {
    try {
      const getComen = await comenModel.find({
        idArtikel: req.params.idArtikel,
      });

      const commentsWithReply = [];

      for (const comen of getComen) {
        console.log(comen._id);
        let reply = await comenModel.find({
          parentComen: comen._id,
        });
        const commentsWithReplies = {
          ...comen.toObject(),
          reply: reply,
        };
        commentsWithReply.push(commentsWithReplies);
      }
      res.status(200).json({
        commentsWithReply,
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
  "/reply/:parentId",
  catchAsyncError(async (req, res, next) => {
    try {
      const getComen = await comenModel.find({
        parentComen: req.params.parentId,
      });

      res.status(200).json({
        comment: getComen,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    }
  })
);

module.exports = router;
