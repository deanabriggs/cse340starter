const express = require("express");
const router = new express.Router();
const errorController = require("../controllers/errorController");

// Route to test error handling
router.get("/problem", errorController.buildProblem);

module.exports = router;
