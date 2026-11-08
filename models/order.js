const { Schema, model } = require("mongoose");
const { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } = require("../utils/constants");

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    // We store a snapshot (name, image, price) of each product at the time of purchase,
    // so old orders still display correctly even if the product is edited or deleted later.
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "product", required: true },
        name: { type: String, required: true },
        image: String,
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    contact: { name: String, phoneNo: String },
    address: { street: String, city: String, state: String, pincode: String, country: String },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUS, default: "Placed" },
    payment: {
      method: { type: String, enum: Object.keys(PAYMENT_METHODS), default: "COD" },
      status: { type: String, enum: PAYMENT_STATUS, default: "Pending" },
      transactionId: String,
    },
  },
  { timestamps: true }
);

module.exports = model("order", orderSchema);
