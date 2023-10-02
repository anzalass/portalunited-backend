const mongoose = require("mongoose");

const comenModel = new mongoose.Schema(
  {
    idArtikel: {
      type: String,
      required: [true, "Artikel not found"],
    },
    idUser: {
      type: String,
      required: [true, "id User not found"],
    },
    namaUser: {
      type: String,
      required: [true, "please login"],
    },
    isi: {
      type: String,
    },
    replies: [
      {
        namaUser: {
          type: String,
          required: [true, "nama user is nothing"],
        },
        comentId: {
          type: Object,
          required: [true, "coment id is nothing"],
        },
        reply: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comen", comenModel);
