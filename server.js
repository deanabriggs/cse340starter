/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const errorRoute = require("./routes/errorRoute");
const baseController = require("./controllers/baseController");
const utilities = require("./utilities");

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
// Error route
app.use("/problem", errorRoute);
// File Not Found Route - must be last route in list
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
  } else {
    message = "Oh no! There was a crash. Maybe try a different route?";
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
