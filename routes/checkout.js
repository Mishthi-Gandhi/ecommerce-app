const express = require("express");
const { requireAuth } = require("../middlewares/auth");
const { handleGetCheckout } = require("../controllers/checkout");

const router = express.Router();

router.get("/", requireAuth, handleGetCheckout);

module.exports = router;
