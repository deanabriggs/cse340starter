const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const itemController = require("../controllers/itemController");

// Route to build item view
router.get("/detail/:invId", itemController.buildByInvId);

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

module.exports = router;
