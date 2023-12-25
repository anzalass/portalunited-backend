const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.originalname.split(".")[0];

    cb(null);
    filename + uniqueSuffix + "-" + ".png";
  },
});

const fileFilters = (req, file, cb) => {
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg"
  ) {
    cb(null, true);
  } else {
    return cb({ message: "Unsupported File Format" }, false);
  }
};

const uploads = multer({
  limits: { fileSize: 1024 * 1024 },
  fileFilter: fileFilters,
});

// exports.upload = multer({ storage: storage });
module.exports = uploads;
