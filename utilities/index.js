const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors"></a>';
      grid += '<div class="namePrice">';
      grid += "<hr>";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the item detail view HTML
 * ************************************ */
Util.buildItemView = async function (data) {
  if (!data) {
    return "<p>Item Detail is not available.</p>";
  }
  const make = data.inv_make;
  const model = data.inv_model;
  const year = data.inv_year;
  const desc = data.inv_description;
  const imgSm = data.inv_thumbnail;
  const imgLg = data.inv_image;
  const price = Number(data.inv_price).toLocaleString();
  const miles = Number(data.inv_miles).toLocaleString();
  const color = data.inv_color;

  return `
    <div id="item-display">
      <img id="imgSm" src="${imgSm}" alt="${make} ${model}"/>
      <img id="imgLg" src="${imgLg}" alt="${make} ${model}"/>
      <div id="item-details">
        <h2>${make} ${model} Details</h2>
        <p><b>Price: $${price}</p></b>
        <p><b>Description:</b> ${desc}</p>
        <p><b>Color:</b> ${color}</p>
        <p><b>Mileage:</b> ${miles}</p>
        <p><b>Year:</b> ${year}</p>
    </div>
  `;
};

/* *****************************************************
 *   Build Classification List for add-inventory.ejs
 *******************************************************/
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option> ";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/****************************************
 * Middleware to check token validity
 ****************************************/
Util.checkJWTToken = (req, res, next) => {
  // Initialize accountData as null
  res.locals.accountData = null;
  res.locals.loggedin = 0;
  res.locals.isEmployee = false; // Initialize employee status
  res.locals.isAdmin = false; // Initialize admin status

  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        res.locals.isEmployee =
          accountData.account_type === "Employee" ||
          accountData.account_type === "Admin"; // Set employee status
        res.locals.isAdmin = accountData.account_type === "Admin"; // Set admin status
        next();
      }
    );
  } else {
    next();
  }
};

/*******************************************
 * Check Login
 *******************************************/
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/*******************************************
 * Check Employee Status
 *******************************************/
Util.checkEmployee = (req, res, next) => {
  try {
    console.log("Starting employee check...");
    console.log("Is employee?", res.locals.isEmployee);

    if (res.locals.isEmployee) {
      console.log("Access granted - is employee");
      next();
    } else {
      console.log("Access denied - not employee");
      req.flash("notice", "Access denied. Employee privileges required.");
      return res.redirect("/account/");
    }
  } catch (error) {
    console.error("Error in employee check:", error);
    req.flash("notice", "An error occurred while verifying access.");
    return res.redirect("/account/");
  }
};

/*******************************************
 * Check Admin Status
 *******************************************/
Util.checkAdmin = (req, res, next) => {
  try {
    console.log("Starting admin check...");
    console.log("Is admin?", res.locals.isAdmin);

    if (res.locals.isAdmin) {
      console.log("Access granted - is admin");
      next();
    } else {
      console.log("Access denied - not an administrator");
      req.flash("notice", "Access denied. Administrator privileges required.");
      return res.redirect("/account/");
    }
  } catch (error) {
    console.error("Error inadmin check:", error);
    req.flash("notice", "An error occurred while verifying access.");
    return res.redirect("/account/");
  }
};

/* ************************
 * Constructs the edit classification Section
 ************************** */
Util.buildEditClassification = async function (req, res, next) {
  // Check if the user is an admin
  if (!res.locals.isAdmin) {
    return ""; // Return empty string if user is not an admin
  }

  let data = await invModel.getClassifications();

  let editClassSection = "<div>";
  editClassSection += "<h2 class='mgmt-subheader'>Manage Classifications</h2>";
  editClassSection += "<div class='content'>";
  editClassSection +=
    "<p>To delete a classification, you must first delete all vehicles in it.</p>";
  let dataTable = "<table>";
  dataTable += "<thead>";
  dataTable += "<tr><th>Classification</th><td>&nbsp;</td><td>&nbsp;</td></tr>";
  dataTable += "</thead>";
  dataTable += "<tbody>";
  data.rows.forEach((element) => {
    dataTable += `<tr><td>${element.classification_name}</td>`;
    dataTable += `<td><a href='/inv/classEdit/${element.classification_id}' title='Click to update'>Modify</a></td>`;
    dataTable += `<td><a href='/inv/classDelete/${element.classification_id}' title='Click to delete'>Delete</a></td></tr>`;
  });
  dataTable += "</tbody>";
  dataTable += "</table>";
  editClassSection += dataTable;
  editClassSection += "</div>";
  editClassSection += "</div>";

  return editClassSection;
};

module.exports = Util;
