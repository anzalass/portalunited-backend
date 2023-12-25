const mongoose = require("mongoose");
const imageArtikelModel = new mongoose.Schema(
  {
    id_artikel: {
      require: true,
      type: String,
    },
    image: {
      require: true,
      type: String,
      default:
        "https://ik.imagekit.io/blogemyu/blog-mu/profile-img/Naruto_W2u8rS8Yr.jpeg?updatedAt=1701843950359",
    },
    imageId: {
      required: true,
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImagesArtikel", imageArtikelModel);
