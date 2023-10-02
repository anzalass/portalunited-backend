const mongoose = require("mongoose");

const categoryModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please insert a category"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categoryModel);
