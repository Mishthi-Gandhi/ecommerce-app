const express = require("express");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const { checkAuthentication } = require("./middlewares/auth");
const { notFound, globalErrorHandler } = require("./middlewares/error");
const { PAYMENT_METHODS } = require("./utils/constants");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ---- helpers available inside every .ejs file ----
app.locals.PAYMENT_METHODS = PAYMENT_METHODS;
app.locals.inr = (n) => Number(n).toLocaleString("en-IN");
app.locals.statusClass = (status) =>
  ({ Placed: "bg-warning text-dark", Shipped: "bg-info text-dark", Delivered: "bg-success", Cancelled: "bg-danger",
     Pending: "bg-warning text-dark", Paid: "bg-success", Refunded: "bg-secondary" }[status] || "bg-secondary");

// ---- security headers ----
// Helmet's default policy would block Bootstrap (loaded from the jsDelivr CDN), so we allow it explicitly.
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "https://cdn.jsdelivr.net"],
        "style-src": ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
        "upgrade-insecure-requests": null, // lets the site run on http://localhost
      },
    },
  })
);

app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkAuthentication);

// ---- routes ----
app.use("/", require("./routes/home"));
app.use("/user", require("./routes/user"));
app.use("/product", require("./routes/product"));
app.use("/cart", require("./routes/cart"));
app.use("/checkout", require("./routes/checkout"));
app.use("/order", require("./routes/order"));
app.use("/admin", require("./routes/admin"));
app.use("/api", require("./routes/api"));

app.use(notFound);
app.use(globalErrorHandler);

module.exports = app;
