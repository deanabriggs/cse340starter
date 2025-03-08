const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

/* ***************************
 *  Get an inventory item by inv_id
 * ************************** */
async function getItemByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      WHERE i.inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getItemByInvId error " + error);
  }
}

/* ***************************
 *  Add New Classificiation
 * ************************** */
async function addNewClassification(classification_name) {
  console.log("addNewClassification starts..."); // for testing
  try {
    const sql = `
      INSERT INTO public.classification (classification_name) 
      VALUES ($1) 
      RETURNING *;
    `;
    console.log(`addNewClassification results... ${sql}`); // for testing
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    console.log(`addNewClassification error results... ${error}`); // for testing
    return "Classification could not be added.";
  }
}

/* ***************************
 * Verify Classification Hasn't already been added
 * ***************************/
async function checkExistingClassification(classification_name) {
  console.log("checkExistingClassification starts..."); // for testing
  try {
    const sql =
      "SELECT * FROM public.classification WHERE classification_name = $1";
    const classification = await pool.query(sql, [classification_name]);
    console.log(`checkExistingClassification results... ${classification}`); // for testing
    return classification.rowCount > 0;
  } catch (error) {
    console.log(`checkExistingClassification error results... ${error}`); // for testing
    return error.message;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getItemByInvId,
  addNewClassification,
  checkExistingClassification,
};
