const express = require("express");
const router = express.Router();

// Static Routes
// Set up "public" folder / subfolders for static files
router.use(express.static("public")); // public is where static resources will be found
router.use("/css", express.static(__dirname + "public/css")); // routes that contain /css will find it in the public/css location
router.use("/js", express.static(__dirname + "public/js")); // routes that contain /js will find it in the public/js location
router.use("/images", express.static(__dirname + "public/images")); // routes that contain /images will find it in the public/images location

module.exports = router;
