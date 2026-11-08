const crypto = require("crypto");
const mongoose = require("mongoose");
const Cart = require("../models/cart");
const Order = require("../models/order");
const Product = require("../models/product");
const AppError = require("../errors/AppError");
const { invalidateProductCaches } = require("../utils/redishelper");
const { ORDER_TRANSITIONS, PLACEHOLDER_IMAGE } = require("../utils/constants");

// Give stock back to the products (used when an order is cancelled or order creation fails)
async function restock(items) {
  await Product.bulkWrite(
    items.map((item) => ({
      updateOne: { filter: { _id: item.productId }, update: { $inc: { stock: item.quantity } } },
    }))
  );
}

async function placeOrder(data, userId) {
  const cart = await Cart.findOne({ userId }).populate("products.productId");
  if (!cart || cart.products.length === 0) {
    throw new AppError("Your cart is empty. Can't place order", 400);
  }
  if (cart.products.some((item) => !item.productId)) {
    throw new AppError("One or more products are no longer available. Please review your cart", 400);
  }

  const items = cart.products.map((item) => ({
    productId: item.productId._id,
    name: item.productId.name,
    image: item.productId.image[0] || PLACEHOLDER_IMAGE,
    quantity: item.quantity,
    price: item.productId.price,
  }));

  // Reduce stock one product at a time with a single atomic MongoDB update:
  // "subtract the quantity ONLY IF enough stock is left". Two people can never buy the last item.
  // If any product fails we put back what we already took.
  const reserved = [];
  try {
    for (const item of items) {
      const result = await Product.updateOne(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
      if (result.modifiedCount !== 1) {
        throw new AppError(`"${item.name}" does not have enough stock`, 400);
      }
      reserved.push(item);
    }

    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const isOnline = data.paymentMethod === "ONLINE_DEMO";

    const order = await Order.create({
      userId,
      products: items,
      contact: { name: data.name, phoneNo: data.phoneNo },
      address: data.address,
      total,
      payment: {
        method: data.paymentMethod,
        // Demo payment: no real money moves. Replace this block with Razorpay/Stripe in a real shop.
        status: isOnline ? "Paid" : "Pending",
        transactionId: isOnline ? `DEMO-${crypto.randomBytes(5).toString("hex").toUpperCase()}` : undefined,
      },
    });

    await Cart.deleteOne({ userId });
    await invalidateProductCaches(items.map((item) => item.productId)); // stock changed
    return order;
  } catch (err) {
    if (reserved.length) {
      await restock(reserved);
      await invalidateProductCaches(reserved.map((item) => item.productId));
    }
    throw err;
  }
}

async function getUserOrders(userId) {
  return Order.find({ userId }).sort({ createdAt: -1 });
}

async function getAllOrders() {
  return Order.find({}).populate("userId", "name email phoneNo").sort({ createdAt: -1 });
}

// A normal user can only open their own order. An admin can open any order.
async function getOrderById(orderId, user) {
  if (!mongoose.isValidObjectId(orderId)) throw new AppError("Order not found", 404);
  const order = await Order.findById(orderId);
  if (!order || (user.role !== "admin" && order.userId.toString() !== user.id)) {
    throw new AppError("Order not found", 404);
  }
  return order;
}

async function applyStatus(order, newStatus) {
  const allowed = ORDER_TRANSITIONS[order.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new AppError(`Cannot change an order from ${order.status} to ${newStatus}`, 400);
  }

  if (newStatus === "Cancelled") {
    await restock(order.products);
    if (order.payment.status === "Paid") order.payment.status = "Refunded"; // demo refund
    await invalidateProductCaches(order.products.map((item) => item.productId));
  }
  if (newStatus === "Delivered" && order.payment.method === "COD") {
    order.payment.status = "Paid"; // cash is collected on delivery
  }
  order.status = newStatus;
  await order.save();
  return order;
}

// Admin changes the status of any order
async function updateOrderStatus(orderId, newStatus) {
  if (!mongoose.isValidObjectId(orderId)) throw new AppError("Order not found", 404);
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404);
  return applyStatus(order, newStatus);
}

// A customer can cancel their own order only while it is still "Placed"
async function cancelOrder(orderId, user) {
  const order = await getOrderById(orderId, user);
  if (order.status !== "Placed") {
    throw new AppError("Only orders that are still in 'Placed' status can be cancelled", 400);
  }
  return applyStatus(order, "Cancelled");
}

module.exports = { placeOrder, getUserOrders, getAllOrders, getOrderById, updateOrderStatus, cancelOrder };
