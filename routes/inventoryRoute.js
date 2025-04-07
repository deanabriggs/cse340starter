const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

// Route to build item view
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInvId)
);

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build management view
router.get(
  "/",
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildMgmt)
);

// Route to build add-classification view
router.get(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildAddClassification)
);

// Route to post add-classification view
router.post(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkEmployee,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.processNewClassification)
);

// Route to build add-inventory view
router.get(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildAddInventory)
);

// Route to post add-inventory view
router.post(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkEmployee,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.processNewInventory)
);

// Manage by Classification
router.get(
  "/getInventory/:classification_id",
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.getInventoryJSON)
);

// Route to build the Edit Inventory view
router.get(
  "/edit/:inv_id",
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildEditInv)
);

// Route to Edit Inventory
router.post(
  "/edit",
  utilities.checkLogin,
  utilities.checkEmployee,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.processUpdateInv)
);

// Route to build Delete view
router.get(
  "/delete/:inv_id",
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.buildDeleteInv)
);

// Route to Delete Inventory Item
router.post(
  "/delete/:inv_id",
  utilities.checkLogin,
  utilities.checkEmployee,
  utilities.handleErrors(invController.processDeleteInv)
);

// Route to build Edit Classification view
router.get(
  "/classEdit/:classification_id",
  utilities.checkLogin,
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildEditClassification)
);

// Route to process Edit Classification
router.post(
  "/classEdit",
  utilities.checkLogin,
  utilities.checkAdmin,
  invValidate.classificationUpdateRules(),
  invValidate.checkClassificationUpdateData,
  utilities.handleErrors(invController.processUpdateClassification)
);

// Route to build Delete Classification view
router.get(
  "/classDelete/:classification_id",
  utilities.checkLogin,
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildDeleteClassification)
);

// Route to process Delete Classification
router.post(
  "/classDelete",
  utilities.checkLogin,
  utilities.checkAdmin,
  utilities.handleErrors(invController.processDeleteClassification)
);

module.exports = router;
