const Joi = require("joi");
const { addressSchema, nameField, phoneField } = require("./userValidator");
const { PAYMENT_METHODS, ORDER_STATUS } = require("../utils/constants");

const placeOrderSchema = Joi.object({
  name: nameField,
  phoneNo: phoneField,
  address: addressSchema,
  paymentMethod: Joi.string().valid(...Object.keys(PAYMENT_METHODS)).required().label("Payment method"),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...ORDER_STATUS).required().label("Status"),
});

module.exports = { placeOrderSchema, updateStatusSchema };
