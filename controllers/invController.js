// Renders webpages (populating design with data), integrates error handling and validation from utilities

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
  const classificationSelect = await utilities.buildClassificationList();
  const editClassifications = await utilities.buildEditClassification(
    req,
    res,
    next
  );
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    classificationSelect,
    editClassifications,
  });
};

/* ***************************
 *  Build Add Classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
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

/* ***************************
 *  Build Add Inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add New Inventory Item",
    nav,
    errors: null,
    classificationList,
  });
};

/* ***************************
 *  Process Adding New Inventory Item
 * ************************** */
invCont.processNewInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  // Add the new item
  const result = await invModel.addNewInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (result) {
    req.flash(
      "notice",
      `The "${inv_year} ${inv_make} ${inv_model}" has been added successfully to the inventory!`
    );
    res.redirect("/inv");
  } else {
    req.flash(
      "notice",
      `Failed to add the "${inv_year} ${inv_make} ${inv_model}". Please try again.`
    );

    let classificationList = await utilities.buildClassificationList(
      classification_id
    );
    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classificationList,
      errors: null,
    });
  }
};

/***************************************************
 * Return Inventory by Classification as JSON
 ***************************************************/
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build Edit Inventory view
 * ************************** */
invCont.buildEditInv = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  let itemData = await invModel.getItemByInvId(inv_id);
  let classificationList = await utilities.buildClassificationList(
    itemData.classification_id
  );
  let itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    errors: null,
    classificationList: classificationList,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  });
};

/* ***************************
 *  Process Updating Inventory Item
 * ************************** */
invCont.processUpdateInv = async function (req, res) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  // Update the item
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    req.flash(
      "notice",
      `The "${inv_year} ${inv_make} ${inv_model}" has been updated successfully!`
    );
    res.redirect("/inv/");
  } else {
    req.flash(
      "notice",
      `Failed to update the "${inv_year} ${inv_make} ${inv_model}". Please try again.`
    );
    let classificationList = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    res.status(501).render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classificationList: classificationList,
      errors: null,
    });
  }
};

/* ***************************
 *  Build Delete Inventory view
 * ************************** */
invCont.buildDeleteInv = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  let itemData = await invModel.getItemByInvId(inv_id);
  let itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/delete-confirm", {
    title: "Confirm Deletion of '" + itemName + "'",
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  });
};

/* ***************************
 *  Process Deteling Inventory Item
 * ************************** */
invCont.processDeleteInv = async function (req, res) {
  let nav = await utilities.getNav();
  const { inv_id, inv_make, inv_model, inv_year, inv_price } = req.body;

  // Delete the item
  const deleteResult = await invModel.deleteInventory(inv_id);

  if (deleteResult) {
    req.flash(
      "notice",
      `The "${inv_year} ${inv_make} ${inv_model}" has been deleted successfully!`
    );
    res.redirect("/inv/");
  } else {
    req.flash(
      "notice",
      `Failed to delete the "${inv_year} ${inv_make} ${inv_model}". Please try again.`
    );
    res.status(501).redirect("/delete/:inv_id");
  }
};

/* ***************************
 *  Build Edit Classification view
 * ************************** */
invCont.buildEditClassification = async function (req, res, next) {
  const classification_id = parseInt(req.params.classification_id);
  let nav = await utilities.getNav();
  let classificationData = await invModel.getClassificationById(
    classification_id
  );
  res.render("./inventory/edit-classification", {
    title: "Edit Classification",
    nav,
    errors: null,
    classification_id: classificationData.classification_id,
    classification_name: classificationData.classification_name,
  });
};

/* ***************************
 *  Process Updating Classification
 * ************************** */
invCont.processUpdateClassification = async function (req, res) {
  let nav = await utilities.getNav();

  // Get the classification_id and classification_name from the request body
  const classification_id = req.body.classification_id;
  const classification_name = req.body.classification_name;

  // Validate that both parameters are present
  if (!classification_id || !classification_name) {
    req.flash("notice", "Missing required parameters. Please try again.");
    return res.redirect("/inv");
  }

  // Update the classification
  const updateResult = await invModel.updateClassification(
    classification_id,
    classification_name
  );

  if (updateResult) {
    req.flash(
      "notice",
      `The classification "${classification_name}" has been updated successfully!`
    );
    // Redirect to the inventory page to refresh the navigation and classification list
    res.redirect("/inv");
  } else {
    req.flash(
      "notice",
      `Failed to update the classification "${classification_name}". Please try again.`
    );
    res.status(501).render("./inventory/edit-classification", {
      title: "Edit Classification",
      nav,
      classification_id,
      classification_name,
      errors: null,
    });
  }
};

/* ***************************
 *  Build Delete Classification view
 * ************************** */
invCont.buildDeleteClassification = async function (req, res, next) {
  const classification_id = parseInt(req.params.classification_id);
  let nav = await utilities.getNav();
  let classificationData = await invModel.getClassificationById(
    classification_id
  );
  res.render("./inventory/delete-classification", {
    title: "Delete Classification",
    nav,
    errors: null,
    classification_id: classificationData.classification_id,
    classification_name: classificationData.classification_name,
  });
};

/* ***************************
 *  Process Deleting Classification
 * ************************** */
invCont.processDeleteClassification = async function (req, res) {
  let nav = await utilities.getNav();
  const { classification_id, classification_name } = req.body;

  // Delete the classification
  const deleteResult = await invModel.deleteClassification(classification_id);

  if (deleteResult) {
    req.flash(
      "notice",
      `The classification "${classification_name}" has been deleted successfully!`
    );
    res.redirect("/inv");
  } else {
    req.flash(
      "notice",
      `Failed to delete the classification "${classification_name}". Ensure no vehicles are associated to this classification and try again.`
    );
    res.status(501).redirect("/inv");
  }
};

module.exports = invCont;
