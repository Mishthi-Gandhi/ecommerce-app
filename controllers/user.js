const { registerUser, loginUser, updateProfile, changePassword } = require("../services/user");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../errors/AppError");

const cookieOptions = {
  httpOnly: true, // JavaScript in the browser cannot read this cookie
  sameSite: "lax", // not sent on cross-site POST requests (protects against CSRF)
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const showLogin = (req, res) => res.render("login");
const showRegister = (req, res) => res.render("signup");

// If a service throws an AppError we show it on the same form instead of a blank error page
const handleRegister = asyncHandler(async (req, res) => {
  try {
    const { token } = await registerUser(req.body);
    res.cookie("token", token, cookieOptions);
    return res.redirect("/");
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).render("signup", { error: err.message, form: req.body });
    throw err;
  }
});

const handleLogin = asyncHandler(async (req, res) => {
  try {
    const { token } = await loginUser(req.body);
    res.cookie("token", token, cookieOptions);
    return res.redirect("/product");
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).render("login", { error: err.message, form: req.body });
    throw err;
  }
});

const handleLogout = (req, res) => {
  res.clearCookie("token");
  return res.redirect("/user/login");
};

const showProfile = (req, res) => res.render("profile");

const handleUpdateProfile = asyncHandler(async (req, res) => {
  try {
    const updated = await updateProfile(req.user.id, req.body);
    res.locals.user = updated; // so the navbar shows the new name straight away
    return res.render("profile", { success: "Profile updated successfully" });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).render("profile", { error: err.message });
    throw err;
  }
});

const handleChangePassword = asyncHandler(async (req, res) => {
  try {
    await changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    return res.render("profile", { success: "Password changed successfully" });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).render("profile", { error: err.message });
    throw err;
  }
});

module.exports = {
  showLogin, showRegister, handleRegister, handleLogin, handleLogout,
  showProfile, handleUpdateProfile, handleChangePassword,
};
