const mongoose = require("mongoose");

const savedModel = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    artikelId: {
      type: String,
      required: true,
    },
    savedBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Saved", savedModel);
