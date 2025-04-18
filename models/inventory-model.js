// Interacts with the database (for GET & POST data)

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
  try {
    const sql = `
      INSERT INTO public.classification (classification_name) 
      VALUES ($1) 
      RETURNING *;
    `;
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    return "Classification could not be added.";
  }
}

/* ***************************
 * Verify Classification Hasn't already been added
 * ***************************/
async function checkExistingClassification(classification_name) {
  try {
    const sql =
      "SELECT * FROM public.classification WHERE classification_name = $1";
    const classification = await pool.query(sql, [classification_name]);
    return classification.rowCount > 0;
  } catch (error) {
    return error.message;
  }
}

/* ***************************
 *  Add New Inventory Item
 * ************************** */
async function addNewInventory(
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
) {
  try {
    const sql = `
      INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *;
    `;
    return await pool.query(sql, [
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
    ]);
  } catch (error) {
    console.log(`addNewInventory error results... ${error}`); // for testing
    return "Inventory Item could not be added.";
  }
}

/* ***************************
 *  Update Inventory Item
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql = `
      UPDATE public.inventory 
      SET inv_make = $1, 
        inv_model = $2, 
        inv_year = $3, 
        inv_description = $4, 
        inv_image = $5, 
        inv_thumbnail = $6, 
        inv_price = $7, 
        inv_miles = $8, 
        inv_color = $9, 
        classification_id = $10  
      WHERE inv_id = $11 
      RETURNING *;`;
    const data = await pool.query(sql, [
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
      inv_id,
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
    return "Inventory item could not be updated.";
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = `
      DELETE FROM public.inventory 
      WHERE inv_id = $1`;
    const data = await pool.query(sql, [inv_id]);

    return data; // should store "1" if successful, "0" if failure
  } catch (error) {
    new Error("Delete Inventory Error");
  }
}

/* ***************************
 * Get Classification by ID
 * ************************** */
async function getClassificationById(classification_id) {
  try {
    const sql =
      "SELECT * FROM public.classification WHERE classification_id = $1";
    const result = await pool.query(sql, [classification_id]);
    return result.rows[0];
  } catch (error) {
    console.error("getClassificationById error: " + error);
    return null;
  }
}

/* ***************************
 * Update Classification
 * ************************** */
async function updateClassification(classification_id, classification_name) {
  try {
    const sql = `
      UPDATE public.classification 
      SET classification_name = $1 
      WHERE classification_id = $2 
      RETURNING *;
    `;
    return await pool.query(sql, [classification_name, classification_id]);
  } catch (error) {
    console.error("updateClassification error: " + error);
    return null;
  }
}

/* ***************************
 * Delete Classification
 * ************************** */
async function deleteClassification(classification_id) {
  try {
    const sql = `
      DELETE FROM public.classification 
      WHERE classification_id = $1 
      RETURNING *;
    `;
    return await pool.query(sql, [classification_id]);
  } catch (error) {
    console.error("deleteClassification error: " + error);
    return null;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getItemByInvId,
  addNewClassification,
  checkExistingClassification,
  addNewInventory,
  updateInventory,
  deleteInventory,
  getClassificationById,
  updateClassification,
  deleteClassification,
};
