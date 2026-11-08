const { getCheckout } = require("../services/checkout");
const { cartTotal } = require("../utils/helpers");
const { PAYMENT_METHODS } = require("../utils/constants");
const asyncHandler = require("../middlewares/asyncHandler");

const handleGetCheckout = asyncHandler(async (req, res) => {
  const cart = await getCheckout(req.user.id);
  res.render("checkout", { cart, total: cartTotal(cart), paymentMethods: PAYMENT_METHODS });
});

module.exports = { handleGetCheckout };
