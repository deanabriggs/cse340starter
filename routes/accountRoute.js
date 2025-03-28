const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const validate = require("../utilities/account-validation");

// Account Management Route
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAcctMgmt)
);

// Login Route
router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.post(
  "/login",
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Register Route
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

router.post(
  "/register",
  validate.registrationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.processAcctReg)
);

// Update Route
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdate)
);

router.post(
  "/update/:account_id",
  validate.checkUpdateType, // Check if updating for info or password, then calls validation rules
  validate.checkUpdateData,
  utilities.handleErrors(accountController.processUpdate)
);

// Logout Route
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});

module.exports = router;
