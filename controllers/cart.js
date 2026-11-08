const { addToCart, getCart, updateCart, removeCart } = require("../services/cart");
const { cartTotal } = require("../utils/helpers");
const asyncHandler = require("../middlewares/asyncHandler");

const handleAddToCart = asyncHandler(async (req, res) => {
  const cart = await addToCart(req.user.id, req.params.id);
  res.status(200).json({ message: "Added to cart", cartCount: cart.products.length });
});

const handleGetCart = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user.id);
  res.render("cart", { cart, total: cartTotal(cart) });
});

const handleUpdateCart = asyncHandler(async (req, res) => {
  await updateCart(req.params.productId, req.user.id, req.body.action);
  res.redirect("/cart");
});

const handleRemoveCart = asyncHandler(async (req, res) => {
  await removeCart(req.params.productId, req.user.id);
  res.redirect("/cart");
});

module.exports = { handleAddToCart, handleGetCart, handleUpdateCart, handleRemoveCart };
