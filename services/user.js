const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../errors/AppError");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

async function registerUser(data) {
  const { name, email, password, phoneNo, address } = data;

  const existing = await User.findOne({ $or: [{ email }, { phoneNo }] });
  if (existing) {
    throw new AppError("An account with this email or phone number already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  // role is never taken from the request: every public signup is a normal "user"
  const user = await User.create({ name, email, password: hashedPassword, phoneNo, address, role: "user" });

  const userObj = user.toObject();
  delete userObj.password;
  return { userObj, token: signToken(user) };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select("+password");
  // same message for "no such user" and "wrong password" so attackers can't find valid emails
  if (!user) throw new AppError("Invalid login credentials", 401);

  const matched = await bcrypt.compare(password, user.password);
  if (!matched) throw new AppError("Invalid login credentials", 401);

  const userObj = user.toObject();
  delete userObj.password;
  return { userObj, token: signToken(user) };
}

async function updateProfile(userId, { name, phoneNo, address }) {
  const clash = await User.findOne({ phoneNo, _id: { $ne: userId } });
  if (clash) throw new AppError("This phone number is already used by another account", 409);
  return User.findByIdAndUpdate(userId, { name, phoneNo, address }, { new: true, runValidators: true });
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select("+password");
  const matched = await bcrypt.compare(currentPassword, user.password);
  if (!matched) throw new AppError("Current password is incorrect", 400);
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
}

module.exports = { registerUser, loginUser, updateProfile, changePassword };
