/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const session = require("express-session");
const flash = require("connect-flash");
const expressMessages = require("express-messages");
const pool = require("./database");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const baseController = require("./controllers/baseController");
const utilities = require("./utilities");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();

/****************************
 * Middleware
 ****************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

// Express Messages Middleware
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = expressMessages(req, res);
  next();
});

// Process Registration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//x-www-form-urlencoded
app.use(cookieParser());
app.use(utilities.checkJWTToken);

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs"); // declares ejs will be the view engine - by default looks for views stored in a views folder
app.use(expressLayouts); // use the express-ejs-layouts (in the expressLayouts variable)
app.set("layout", "./layouts/layout"); // not at views root - basic template for view will be in a layouts folder and template name of layout

/* ***********************
 * Routes
 *************************/
app.use(static);
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));
// Inventory routes
app.use("/inv", inventoryRoute);
// Account route
app.use("/account", accountRoute);

// File Not Found Route - must be LAST route in list
app.use(async (req, res, next) => {
  next({
    status: 404,
    message: "Sorry, we can't seem to locate that page.",
  });
});

/* **********************
 * Express Error Handling
 * PLACE AFTER ALL OTHER MIDDLEWARE
 ************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  if (err.status == 404) {
    message = err.message;
    console.error(err.stack);
  } else {
    message = "Oh no! There was a crash. Try something else?";
    console.error(err.stack);
  }
  res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
