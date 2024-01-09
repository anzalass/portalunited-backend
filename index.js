const app = require("./app");
const connectDatabase = require("./db/Database");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config({
  path: "././config/.env",
});

app.use(cookieParser());

// handling uncaught exceptions
process.on("uncaughtExceptions", (err) => {
  console.log(`error: ${err}`);
  console.log(`shutting down server with error ${err}`);
});

// connectDB
connectDatabase();

// create server
const server = app.listen("8000", () => {
  console.log(`server listening on 8000`);
});

// unhandled promise rejection
process.on("unhandled promise rejection", () => {
  console.log(`unhandled promise rejection ${err.message}.`);

  server.close(() => {
    process.exit(1);
  });
});

// console.log(process.env.NODE_ENV + "hahah");
