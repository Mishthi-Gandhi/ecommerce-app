const { getCart } = require("./cart");
const AppError = require("../errors/AppError");

async function getCheckout(userId) {
  const cart = await getCart(userId);
  if (!cart || cart.products.length === 0) {
    throw new AppError("Your cart is empty", 400);
  }
  return cart;
}

module.exports = { getCheckout };
