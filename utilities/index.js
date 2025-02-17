const invModel = require("../models/inventory-model");
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
        'details"><img src="' +
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

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
