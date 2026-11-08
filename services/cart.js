const mongoose = require("mongoose");
const Cart = require("../models/cart");
const Product = require("../models/product");
const AppError = require("../errors/AppError");

async function addToCart(userId, productId) {
  if (!mongoose.isValidObjectId(productId)) throw new AppError("Product not found", 404);
  const product = await Product.findById(productId);
  if (!product) throw new AppError("Product not found", 404);
  if (product.stock < 1) throw new AppError("This product is out of stock", 400);

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    return Cart.create({ userId, products: [{ productId, quantity: 1 }] });
  }

  const item = cart.products.find((prod) => prod.productId.toString() === productId);
  if (item) {
    if (item.quantity + 1 > product.stock) {
      throw new AppError(`Only ${product.stock} item(s) available in stock`, 400);
    }
    item.quantity += 1;
  } else {
    cart.products.push({ productId, quantity: 1 });
  }
  await cart.save();
  return cart;
}

async function getCart(userId) {
  const cart = await Cart.findOne({ userId }).populate("products.productId");
  if (!cart) return null;

  // drop products that were deleted by an admin after being added to the cart
  const valid = cart.products.filter((item) => item.productId);
  if (valid.length !== cart.products.length) {
    cart.products = valid;
    await cart.save();
  }
  return cart;
}

async function updateCart(productId, userId, action) {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new AppError("Cart not found", 404);

  const index = cart.products.findIndex((prod) => prod.productId.toString() === productId);
  if (index < 0) throw new AppError("Product not found in cart", 404);

  let quantity = cart.products[index].quantity;
  if (action === "increase") {
    const product = await Product.findById(productId);
    if (!product || quantity + 1 > product.stock) {
      throw new AppError(`Only ${product ? product.stock : 0} item(s) available in stock`, 400);
    }
    quantity += 1;
  } else if (action === "decrease") {
    quantity -= 1;
  } else {
    throw new AppError("Invalid action", 400);
  }

  if (quantity <= 0) cart.products.splice(index, 1);
  else cart.products[index].quantity = quantity;
  await cart.save();
}

async function removeCart(productId, userId) {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new AppError("Cart not found", 404);

  const index = cart.products.findIndex((prod) => prod.productId.toString() === productId);
  if (index < 0) throw new AppError("Product not found in cart", 404);

  cart.products.splice(index, 1);
  await cart.save();
}

module.exports = { addToCart, getCart, updateCart, removeCart };
