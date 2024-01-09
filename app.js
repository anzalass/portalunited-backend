const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const ErrorHandler = require("./middleware/error");
const dotenv = require("dotenv");
var cookieSession = require("cookie-session");

dotenv.config();

// app.use(cookieSession());

app.use(express.json());
app.use("/", express.static("uploads"));
app.use(cookieParser());
const corsOptions = {
  origin: https://portalunited.vercel.app'', // Replace with your frontend's origin
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'], // Allow specific HTTP methods
  credentials: true, // Enable credentials (e.g., cookies, HTTP authentication)
  optionsSuccessStatus: 204, // Respond with a 204 No Content status for preflight requests
};

// Enable CORS for all routes using the configured options
app.use(cors(corsOptions));
const user = require("./api/user/userController");
app.use("/api/v2/user", user);

const category = require("./api/category/categoryController");
app.use("/api/v2/category", category);

const artikel = require("./api/artikel/artikelController");
app.use("/api/v2/artikel", artikel);

const saved = require("./api/saved/savedController");
app.use("/api/v2/saved", saved);

const comen = require("./api/coment/comenController");
app.use("/api/v2/comen", comen);

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(ErrorHandler);

module.exports = app;
