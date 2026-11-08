const {
  placeOrder, getUserOrders, getAllOrders, getOrderById, updateOrderStatus, cancelOrder,
} = require("../services/order");
const { ORDER_TRANSITIONS } = require("../utils/constants");
const asyncHandler = require("../middlewares/asyncHandler");

// After placing an order we REDIRECT to its page, so refreshing the page never places it twice
const handlePlaceOrder = asyncHandler(async (req, res) => {
  const order = await placeOrder(req.body, req.user.id);
  res.redirect(`/order/${order._id}?placed=1`);
});

const handleGetAllOrders = asyncHandler(async (req, res) => {
  const orders = await getUserOrders(req.user.id);
  res.render("allOrders", { orders });
});

const handleGetOrder = asyncHandler(async (req, res) => {
  const order = await getOrderById(req.params.id, req.user);
  res.render("order", { order, justPlaced: req.query.placed === "1" });
});

const handleCancelOrder = asyncHandler(async (req, res) => {
  await cancelOrder(req.params.id, req.user);
  res.redirect(`/order/${req.params.id}`);
});

// ---- admin ----
const handleGetOrdersOfAllUsers = asyncHandler(async (req, res) => {
  const orders = await getAllOrders();
  res.render("adminOrders", { orders, transitions: ORDER_TRANSITIONS });
});

const handleUpdateOrderStatus = asyncHandler(async (req, res) => {
  await updateOrderStatus(req.params.id, req.body.status);
  res.redirect("/admin/orders");
});

module.exports = {
  handlePlaceOrder, handleGetAllOrders, handleGetOrder, handleCancelOrder,
  handleGetOrdersOfAllUsers, handleUpdateOrderStatus,
};
