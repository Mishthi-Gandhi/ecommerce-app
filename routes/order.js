const express = require("express");
const { requireAuth } = require("../middlewares/auth");
const { validate } = require("../middlewares/validation");
const { placeOrderSchema } = require("../validators/orderValidator");
const { handlePlaceOrder, handleGetAllOrders, handleGetOrder, handleCancelOrder } = require("../controllers/order");

const router = express.Router();

router.post("/place", requireAuth, validate(placeOrderSchema), handlePlaceOrder);
router.get("/", requireAuth, handleGetAllOrders);
router.get("/:id", requireAuth, handleGetOrder);
router.post("/:id/cancel", requireAuth, handleCancelOrder);

module.exports = router;
