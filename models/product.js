const { Schema, model } = require("mongoose");
const { PLACEHOLDER_IMAGE } = require("../utils/constants");

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: [String], default: [PLACEHOLDER_IMAGE] },
    createdBy: { type: Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true }
);

module.exports = model("product", productSchema);
