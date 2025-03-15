const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build item view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const item_id = req.params.invId;
  const data = await invModel.getItemByInvId(item_id);
  const details = await utilities.buildItemView(data);
  let nav = await utilities.getNav();
  const itemName = `${data.inv_year} ${data.inv_make} ${data.inv_model}`;
  res.render("./inventory/detail", {
    title: itemName,
    nav,
    details,
  });
};

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildMgmt = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
  });
};

/* ***************************
 *  Build Add Classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  console.log(`start buildAddClassification`); // for testing
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
};

/* ***************************
 *  Process Adding New Classification
 * ************************** */
invCont.processNewClassification = async function (req, res) {
  console.log(`start processNewClassification`); // for testing

  let nav = await utilities.getNav();
  const { classification_name } = req.body;

  // Add the new classification
  const result = await invModel.addNewClassification(classification_name);

  if (result) {
    req.flash(
      "notice",
      `"${classification_name}" has been added successfully as a category!`
    );
    res.redirect("/inv");
  } else {
    req.flash(
      "notice",
      `Failed to add "${classification_name}". Please try again.`
    );
    res.status(501).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      classification_name,
      errors: null,
    });
  }
};

module.exports = invCont;
