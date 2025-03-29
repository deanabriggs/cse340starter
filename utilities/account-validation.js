const utilities = require("./index");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");
const validate = {};

/****************************************
 * Registration Data Validation Rules
 ****************************************/
validate.registrationRules = () => {
  return [
    // firstname is required and must be a string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    // lastname is required and must be a string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    // valid email is required and connot already exist in the DB
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        if (emailExists) {
          throw new Error(
            "Email exists. Please log in or use different email."
          );
        }
      }),
    // password is required and must be strong
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/***********************************************************
 * Check data and return errors or continue to registration
 ***********************************************************/
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/****************************************
 * Login Data Validation Rules
 ****************************************/
validate.loginRules = () => {
  return [
    // valid email is required
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
    // password is required and must be strong
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .custom(async (account_password, { req }) => {
        const account_email = req.body.account_email;
        const matchExists = await accountModel.checkPasswordMatch(
          account_email,
          account_password
        );
        if (!matchExists) {
          throw new Error("Incorrect password. Try again.");
        }
      }),
  ];
};

/***********************************************************
 * Check data and return errors or continue home page
 ***********************************************************/
validate.checkLoginData = async (req, res, next) => {
  const email = req.body.account_email;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email: email,
    });
    return;
  }
  next();
};

/****************************************
 * Update Account Info Validation Rules
 ****************************************/
validate.updateInfoRules = () => {
  return [
    // firstname is required and must be a string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    // lastname is required and must be a string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const currentEmail = req.body.current_email; // Get the current email from the form
        if (account_email === currentEmail) {
          return true; // Allow if it's the same as current email
        }
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        if (emailExists) {
          console.log("updateInfoRules: Email exists");
          throw new Error("Email exists. Please use a different email.");
        }
        return true;
      }),
  ];
};

/****************************************
 * Update Password Validation Rules
 ****************************************/
validate.updatePasswordRules = () => {
  return [
    // new password is required and must be strong
    body("new_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("New password does not meet requirements."),
  ];
};

/****************************************
 * Check Update Info Data
 ****************************************/
validate.checkUpdateInfo = async (req, res, next) => {
  console.log("checkUpdateInfo");
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      errors,
      title: "Manage Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/****************************************
 * Check Update Password Data
 ****************************************/
validate.checkUpdatePassword = async (req, res, next) => {
  console.log("checkUpdatePassword");
  const { current_password, new_password, confirm_password } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      errors,
      title: "Manage Account",
      nav,
      current_password,
      new_password,
      confirm_password,
    });
    return;
  }
  next();
};

/****************************************
 * Check Update Data
 ****************************************/
validate.checkUpdateData = async (req, res, next) => {
  console.log("checkUpdateData");

  if (req.validationRules) {
    // Run all validation rules
    await Promise.all(req.validationRules.map((rule) => rule.run(req)));
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();

    return res.render("account/update", {
      errors,
      title:
        req.body.update_type === "info" ? "Manage Account" : "Update Password",
      nav,
      ...req.body, // Preserve user-entered data
    });
  }

  next();
};

/****************************************
 * Check Update Type
 ****************************************/
validate.checkUpdateType = (req, res, next) => {
  console.log("checkUpdateType");

  if (req.body.update_type === "info") {
    req.validationRules = validate.updateInfoRules(); // Attach validation rules
  } else if (req.body.update_type === "password") {
    req.validationRules = validate.updatePasswordRules();
  } else {
    req.flash("notice", "Invalid update type.");
    return res.redirect("/account/update/" + req.params.account_id);
  }

  next();
};

module.exports = validate;
