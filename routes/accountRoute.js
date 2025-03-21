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

module.exports = router;
