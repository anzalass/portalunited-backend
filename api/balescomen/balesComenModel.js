const mongoose = require("mongoose");

const balesComenModel = new mongoose.Schema(
  {
    idArtikel: {
      type: String,
      required: [true, "Artikel not found"],
    },
    idUser: {
      type: String,
      required: [true, "please login"],
    },
    namaUser: {
      type: String,
      required: [true, "please login"],
    },
    parentComen: {
      type: String,
      required: [true, "please login"],
    },
    isi: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("balesComen", balesComenModel);
