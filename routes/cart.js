const express = require("express");
const { requireAuth } = require("../middlewares/auth");
const { handleAddToCart, handleGetCart, handleUpdateCart, handleRemoveCart } = require("../controllers/cart");

const router = express.Router();

router.post("/add/:id", requireAuth, handleAddToCart);
router.get("/", requireAuth, handleGetCart);
router.post("/update/:productId", requireAuth, handleUpdateCart);
router.post("/remove/:productId", requireAuth, handleRemoveCart);

module.exports = router;
