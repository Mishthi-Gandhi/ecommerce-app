const express = require("express");
const { handleHome } = require("../controllers/home");
const router = express.Router();

router.get("/", handleHome);

module.exports = router;
