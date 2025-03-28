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
        if (!emailExists) {
          throw new Error(
            "Email does not exist. Please register or use different email."
          );
        }
      }),
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
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        if (emailExists) {
          console.log("updateInfoRules: Email exists");
          throw new Error("Email exists. Please use a different email.");
        }
      }),
  ];
};

/****************************************
 * Update Password Validation Rules
 ****************************************/
validate.updatePasswordRules = () => {
  return [
    // current password is required
    body("current_password")
      .trim()
      .notEmpty()
      .withMessage("Current password is required."),
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
    // confirm password must match new password
    body("confirm_password")
      .trim()
      .notEmpty()
      .custom((value, { req }) => {
        if (value !== req.body.new_password) {
          throw new Error("Passwords do not match.");
        }
        return true;
      }),
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
      title: "Update Account",
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
      title: "Update Password",
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
  if (req.body.update_type === "info") {
    validate.checkUpdateInfo(req, res, next);
  } else if (req.body.update_type === "password") {
    validate.checkUpdatePassword(req, res, next);
  } else {
    next();
  }
};

/****************************************
 * Check Update Type
 ****************************************/
validate.checkUpdateType = (req, res, next) => {
  console.log("checkUpdateType");
  if (req.body.update_type === "info") {
    validate.updateInfoRules();
  } else if (req.body.update_type === "password") {
    validate.updatePasswordRules();
  } else {
    req.flash("notice", "Invalid update type.");
    res.redirect("/account/update/" + req.params.account_id);
  }
  next();
};

module.exports = validate;
