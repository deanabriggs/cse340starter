const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

/******************************
 * Deliver login view
 ******************************/
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/******************************
 * Deliver registration view
 ******************************/
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/******************************
 * Process Registration
 ******************************/
async function processAcctReg(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  );
  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.redirect("/account/login");
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

/******************************
 * Process Login
 ******************************/
async function processLogin(req, res) {
  const { account_email, account_password } = req.body;
  let nav = await utilities.getNav();

  try {
    const loginSuccess = await accountModel.checkPasswordMatch(
      account_email,
      account_password
    );

    if (!loginSuccess) {
      req.flash("notice", "Sorry, login failed.");
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
    req.flash("notice", `You're logged in!`);
    res.redirect("/");
  } catch (error) {
    req.flash("notice", "An error occurred. Please try again.");
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }
}

/****************************************
 * Process Login Request
 * ************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

/******************************
 * Deliver Account Management view
 ******************************/
async function buildAcctMgmt(req, res, next) {
  console.log("Building Account Management View...");
  let nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  });
}

/******************************
 * Build Account Update view
 ******************************/
async function buildUpdate(req, res, next) {
  let nav = await utilities.getNav();

  try {
    if (!res.locals.accountData) {
      req.flash("notice", "Please log in to update your account.");
      return res.redirect("/account/login");
    }

    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: res.locals.accountData,
    });
  } catch (error) {
    req.flash("notice", "Sorry, there was an error loading the update page.");
    res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: null,
    });
  }
}

/****************************************
 * Process Account Update
 ****************************************/
async function processUpdate(req, res) {
  console.log("processUpdate");
  let nav = await utilities.getNav();
  const account_id = parseInt(req.params.account_id);

  try {
    // Verify the account_id matches the logged-in user
    if (account_id !== res.locals.accountData.account_id) {
      req.flash("notice", "You can only update your own account.");
      return res.redirect("/account/");
    }

    if (req.body.update_type === "info") {
      const { account_firstname, account_lastname, account_email, account_id } =
        req.body;
      const updateResult = await accountModel.updateAcctInfo(
        account_id,
        account_firstname,
        account_lastname,
        account_email
      );

      // Check if updateResult is an error message
      if (typeof updateResult === "string") {
        console.error("Update error:", updateResult);
        req.flash("notice", "Sorry, the account information update failed.");
        return res.status(500).render("account/update", {
          title: "Update Account",
          nav,
          errors: null,
          accountData: res.locals.accountData,
        });
      }

      req.flash("notice", "Account information updated successfully.");
      res.status(500).render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
        accountData: res.locals.accountData,
      });
    } else if (req.body.update_type === "password") {
      const { account_id, new_password } = req.body;

      // Update password (hashing is handled in the model)
      const updateResult = await accountModel.updateAcctPassword(
        account_id,
        new_password
      );

      // Check if updateResult is an error message
      if (typeof updateResult === "string") {
        console.error("Update error:", updateResult);
        req.flash("notice", "Sorry, the password update failed.");
        return res.status(500).render("account/update", {
          title: "Update Account",
          nav,
          errors: null,
          accountData: res.locals.accountData,
        });
      }

      req.flash("notice", "Password updated successfully.");
      res.status(500).render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
        accountData: res.locals.accountData,
      });
    } else {
      req.flash("notice", "Invalid update type.");
      res.redirect("/account/update/" + account_id);
    }
  } catch (error) {
    console.error("Error in processUpdate:", error);
    req.flash("notice", "Sorry, there was an error updating your account.");
    res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData: res.locals.accountData,
    });
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  buildAcctMgmt,
  processAcctReg,
  processLogin,
  accountLogin,
  buildUpdate,
  processUpdate,
};
