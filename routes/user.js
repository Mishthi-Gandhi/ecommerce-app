const express = require("express");
const { requireAuth } = require("../middlewares/auth");
const { validate } = require("../middlewares/validation");
const { loginLimiter } = require("../middlewares/rateLimiter");
const {
  registerSchema, loginSchema, profileSchema, changePasswordSchema,
} = require("../validators/userValidator");
const {
  showLogin, showRegister, handleRegister, handleLogin, handleLogout,
  showProfile, handleUpdateProfile, handleChangePassword,
} = require("../controllers/user");

const router = express.Router();

router.get("/login", showLogin);
router.get("/register", showRegister);
router.post("/register", loginLimiter, validate(registerSchema, "signup"), handleRegister);
router.post("/login", loginLimiter, validate(loginSchema, "login"), handleLogin);
router.post("/logout", handleLogout);

router.get("/profile", requireAuth, showProfile);
router.post("/profile", requireAuth, validate(profileSchema, "profile"), handleUpdateProfile);
router.post("/password", requireAuth, validate(changePasswordSchema, "profile"), handleChangePassword);

module.exports = router;
