const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ***************************
 *  Build item view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const item_id = req.params.invId;
  const data = await invModel.getItemByInvId(item_id);
  const details = await utilities.buildItemView(data);
  let nav = await utilities.getNav();
  const itemName = `${data.inv_year} ${data.inv_make} ${data.inv_model}`;
  res.render("./inventory/detail", {
    title: itemName,
    nav,
    details,
  });
};

module.exports = invCont;
