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

module.exports = {
  registerAccount,
  checkExistingEmail,
  checkPasswordMatch,
  getAccountByEmail,
};
