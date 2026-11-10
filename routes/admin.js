const express = require("express");
const { requireAuth, restrictTo } = require("../middlewares/auth");
const { validate } = require("../middlewares/validation");
const { updateStatusSchema } = require("../validators/orderValidator");
const { handleGetOrdersOfAllUsers, handleUpdateOrderStatus } = require("../controllers/order");

const router = express.Router();
router.use(requireAuth, restrictTo(["admin"]));

router.get("/orders", handleGetOrdersOfAllUsers);
router.post("/orders/:id/status", validate(updateStatusSchema), handleUpdateOrderStatus);

module.exports = router;
