const Joi = require("joi");

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$%^*!#&]).+$/;
const passwordField = Joi.string().min(8).max(72).pattern(PASSWORD_RULE).messages({
  "string.pattern.base":
    "Password must contain an uppercase letter, a lowercase letter, a number and a special character (@$%^*!#&)",
});

const addressSchema = Joi.object({
  street: Joi.string().trim().min(3).max(200).required().label("Street"),
  city: Joi.string().trim().min(2).max(100).required().label("City"),
  state: Joi.string().trim().min(2).max(100).required().label("State"),
  pincode: Joi.string().trim().pattern(/^[0-9]{6}$/).required().label("Pincode")
    .messages({ "string.pattern.base": "Pincode must be 6 digits" }),
  country: Joi.string().trim().min(2).max(100).required().label("Country"),
}).required().label("Address");

const nameField = Joi.string().trim().min(3).max(100).pattern(/^[A-Za-z ]+$/).required().label("Name")
  .messages({ "string.pattern.base": "Name can contain only letters and spaces" });

const phoneField = Joi.string().trim().pattern(/^[0-9]{10}$/).required().label("Phone number")
  .messages({ "string.pattern.base": "Phone number must be 10 digits" });

// NOTE: "role" is deliberately NOT allowed here. Joi rejects unknown fields, so nobody can
// register as an admin by sending role=admin. Admins are created with `npm run seed`.
const registerSchema = Joi.object({
  name: nameField,
  email: Joi.string().trim().lowercase().email().required().label("Email"),
  password: passwordField.required().label("Password"),
  phoneNo: phoneField,
  address: addressSchema,
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().label("Email"),
  password: Joi.string().required().label("Password"),
});

const profileSchema = Joi.object({
  name: nameField,
  phoneNo: phoneField,
  address: addressSchema,
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().label("Current password"),
  newPassword: passwordField.required().label("New password"),
});

module.exports = { registerSchema, loginSchema, profileSchema, changePasswordSchema, addressSchema, nameField, phoneField };
