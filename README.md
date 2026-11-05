# Swifty – Ecommerce Web App

A full-stack ecommerce website where customers can browse products, fill a cart, check out and track orders, and admins can manage products and orders.
Built with **Node.js, Express, MongoDB, Redis and EJS**.

## Features

**Customers**
- Sign up / sign in (passwords hashed with bcrypt, login kept in an HTTP-only JWT cookie)
- Browse products with search, category filter, price range, "in stock only", sorting and pagination
- Product detail page
- Shopping cart (add, change quantity, remove) with stock checks
- Checkout with delivery address and payment method (Cash On Delivery or a demo online payment)
- Order history, order detail page, and cancel an order while it is still "Placed"
- Profile page: update details / default address, change password

**Admins**
- Add, edit and delete products (with image upload)
- See every customer's orders and move them through `Placed → Shipped → Delivered` (or `Cancelled`)

**Engineering**
- Layered structure: `routes → controllers → services → models`
- Input validation with Joi, central error handling with a custom `AppError`
- Security: Helmet (CSP), rate limiting on login and API, role-based access, HTTP-only `SameSite` cookies, escaped output, safe file uploads, regex-escaped search
- Redis caching of product lists / pages with automatic invalidation. **Redis is optional**: if it is not running the app still works
- Stock is reduced with atomic MongoDB updates, so two customers can never buy the last item
- Orders store a snapshot of each product (name, price, image), so old orders stay correct if a product is edited or deleted
- JSON API: `GET /api/product` and `GET /api/product/:id`
- Tests: unit tests plus an end-to-end smoke test

## Tech stack

| Area | Tools |
|---|---|
| Server | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Cache | Redis (optional) |
| Views | EJS + Bootstrap 5 |
| Auth | JWT in cookies, bcrypt |
| Validation / security | Joi, Helmet, express-rate-limit, multer |

## Getting started

**Requirements:** Node.js 20.19+, a MongoDB database (local or free MongoDB Atlas), and optionally Redis.

```bash
# 1. install dependencies
npm install

# 2. create your own .env from the template and edit the values
cp .env.example .env        # on Windows: copy .env.example .env

# 3. create the first admin account and some sample products
npm run seed

# 4. start the app
npm run dev                 # auto-restarts on changes (or: npm start)
```

Open http://localhost:3000. Sign in as the admin with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env` (defaults: `admin@example.com` / `Admin@12345`) and change that password from the profile page.

Regular customers sign up through the **Sign up** page. Nobody can make themselves an admin from the sign-up form.

### Environment variables

| Name | Purpose |
|---|---|
| `PORT` | Port to run on (default 3000) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URL` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign login tokens |
| `REDIS_URL` | Redis address (optional) |
| `ADMIN_*` | Used only by `npm run seed` |

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Run the server |
| `npm run dev` | Run with nodemon (auto restart) |
| `npm run seed` | Create the admin user and sample products |
| `npm test` | Run unit tests (no database needed) |
| `npm run smoke` | End-to-end test of the whole shop against a running server |

## Project structure

```
├── app.js                 Express app (middleware + routes)
├── index.js               Starts the server and connects to MongoDB / Redis
├── config/redis.js        Redis client (optional)
├── routes/                URL → controller
├── controllers/           Read the request, call a service, send the response
├── services/              Business logic (cart, orders, stock, auth...)
├── models/                Mongoose schemas
├── validators/            Joi schemas
├── middlewares/           auth, validation, errors, uploads, rate limiting
├── utils/                 helpers, constants, Redis cache helpers
├── views/                 EJS pages and partials
├── public/                CSS, JS, images and uploaded files
├── scripts/               seed.js and smoke.js
└── tests/                 unit tests
```

## Order status flow

```
Placed ──► Shipped ──► Delivered
   │          │
   └──────────┴──► Cancelled   (stock is returned, paid orders are marked Refunded)
```

## Notes and limitations

- **Payment is a simulation.** "Online Payment (Demo)" marks the order as paid with a fake transaction id and never charges money. To accept real payments, replace the payment block in `services/order.js` with Razorpay or Stripe.
- Forms rely on `SameSite=Lax` cookies for CSRF protection. A production shop should also add CSRF tokens.
- No email notifications, password reset or product reviews yet.

## Ideas for the future

Razorpay/Stripe checkout, email confirmations, password reset, product reviews, multiple product images, an admin dashboard with sales charts.
