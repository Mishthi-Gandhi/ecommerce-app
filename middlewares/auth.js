const Cart = require("../models/cart");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const AppError = require("../errors/AppError");

// Runs on every request: reads the login cookie and makes the user available to routes and views.
async function checkAuthentication(req, res, next) {
  res.locals.user = null;
  res.locals.cartCount = 0;
  const token = req.cookies?.token;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (user) {
      req.user = user;
      res.locals.user = user;
      const cart = await Cart.findOne({ userId: user._id }).select("products");
      res.locals.cartCount = cart ? cart.products.length : 0;
    }
  } catch {
    res.clearCookie("token"); // invalid or expired token
  }
  next();
}

function requireAuth(req, res, next) {
  if (req.user) return next();
  // fetch() calls (e.g. "Add to cart") ask for JSON, normal pages get a redirect
  if (req.accepts(["html", "json"]) === "json") {
    return res.status(401).json({ message: "Please log in first", login: "/user/login" });
  }
  return res.redirect("/user/login");
}

function restrictTo(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Access denied", 403));
    }
    next();
  };
}

module.exports = { checkAuthentication, requireAuth, restrictTo };
