const mongoose = require("mongoose");

const artikelModel = new mongoose.Schema(
  {
    title: {
      required: true,
      type: String,
    },
    author: {
      required: true,
      type: Object,
    },
    slug: {
      type: String,
      required: true,
    },
    tags: {
      type: String,
      required: true,
    },
    authorId: {
      required: [true, "wajib"],
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    isi: {
      type: String,
      required: true,
    },
    category: {
      type: Object,
      ref: "Category",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Artikel", artikelModel);
