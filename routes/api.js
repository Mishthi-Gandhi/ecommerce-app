const express = require("express");
const { apiLimiter } = require("../middlewares/rateLimiter");
const { handleGetProductsAPI, handleGetProductAPI } = require("../controllers/product");

const router = express.Router();

router.get("/product", apiLimiter, handleGetProductsAPI);
router.get("/product/:id", apiLimiter, handleGetProductAPI);

module.exports = router;
