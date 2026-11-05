const ORDER_STATUS = ["Placed", "Shipped", "Delivered", "Cancelled"];

// which status an order is allowed to move to next
const ORDER_TRANSITIONS = {
  Placed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

const PAYMENT_METHODS = {
  COD: "Cash On Delivery",
  ONLINE_DEMO: "Online Payment (Demo)",
};

const PAYMENT_STATUS = ["Pending", "Paid", "Refunded"];

const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

module.exports = { ORDER_STATUS, ORDER_TRANSITIONS, PAYMENT_METHODS, PAYMENT_STATUS, PLACEHOLDER_IMAGE };
