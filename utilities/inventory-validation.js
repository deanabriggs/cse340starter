const utilities = require("./index");
const { body, validationResult } = require("express-validator");
const inventoryModel = require("../models/inventory-model");
const invValidate = {};

/****************************************
 * Classification Validation Rules
 ****************************************/
invValidate.classificationRules = () => {
  console.log(`start classificationRules`); // for testing
  return [
    // Classification is required and must be a string
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a valid classification name.")
      .custom(async (classification_name) => {
        const classificationExists =
          await inventoryModel.checkExistingClassification(classification_name);
        if (classificationExists) {
          throw new Error("Classification exists. Try again.");
        }
      }),
  ];
};

/***********************************************************
 * Check data and return errors or continue to add-classification
 ***********************************************************/
invValidate.checkClassificationData = async (req, res, next) => {
  console.log(`start checkClassificationData`); // for testing
  const { classification_name } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name: classification_name,
      notice: req.flash("notice")[0] || null,
    });

    return;
  }
  next();
};

module.exports = invValidate;
