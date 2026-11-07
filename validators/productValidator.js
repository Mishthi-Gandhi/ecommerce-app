const Joi = require("joi");

const productSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required().label("Name"),
  description: Joi.string().trim().min(5).max(2000).required().label("Description"),
  price: Joi.number().min(0).required().label("Price"),
  category: Joi.string().trim().min(2).max(60).required().label("Category"),
  stock: Joi.number().integer().min(0).required().label("Stock"),
});

module.exports = { productSchema };
