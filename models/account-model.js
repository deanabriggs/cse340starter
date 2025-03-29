const pool = require("../database/");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

/***********************************
 * Register new account
 ***********************************/
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const hashPW = await bcrypt.hash(account_password, saltRounds);
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      hashPW,
    ]);
  } catch (error) {
    return error.message;
  }
}

async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount > 0;
  } catch (error) {
    return error.message;
  }
}

async function checkPasswordMatch(account_email, account_password) {
  try {
    const sql = "SELECT account_password FROM account WHERE account_email = $1";
    const match = await pool.query(sql, [account_email]);
    if (match.rowCount === 0) {
      return false;
    }
    const hashedPW = match.rows[0].account_password;
    const matchPW = await bcrypt.compare(account_password, hashedPW);

    return matchPW; // Returns true if match
  } catch (error) {
    return false;
  }
}

async function checkEmployee(account_email) {
  try {
    console.log("Checking employee status for email:", account_email);
    const sql = "SELECT account_type FROM account WHERE account_email = $1";
    const account = await pool.query(sql, [account_email]);
    console.log("Query result:", account.rows[0]);

    if (account.rowCount === 0) {
      console.log("No account found");
      return false;
    }

    const isEmployee =
      account.rows[0].account_type === "Employee" ||
      account.rows[0].account_type === "Admin";
    console.log("Is employee?", isEmployee);
    return isEmployee;
  } catch (error) {
    console.error("Error in checkEmployee:", error);
    return false;
  }
}

/*********************************************
 * Return account data using email address
 *********************************************/
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching email found");
  }
}

/***********************************
 * Update account information
 ***********************************/
async function updateAcctInfo(
  account_id,
  account_firstname,
  account_lastname,
  account_email
) {
  try {
    const sql =
      "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4";
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    ]);

    // Check if the update affected any rows
    if (result.rowCount > 0) {
      return true; // Indicate success
    } else {
      return "No rows were updated.";
    }
  } catch (error) {
    return error.message;
  }
}

/***********************************
 * Update account password
 ***********************************/
async function updateAcctPassword(account_id, account_password) {
  try {
    const hashPW = await bcrypt.hash(account_password, saltRounds);
    const sql =
      "UPDATE account SET account_password = $1 WHERE account_id = $2";
    return await pool.query(sql, [hashPW, account_id]);
  } catch (error) {
    return error.message;
  }
}

/*********************************************
 * Return account data using account ID
 *********************************************/
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1",
      [account_id]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching account found");
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  checkPasswordMatch,
  checkEmployee,
  getAccountByEmail,
  updateAcctInfo,
  updateAcctPassword,
  getAccountById,
};
