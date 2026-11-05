require("dotenv").config(); // must run before the other files read process.env

const mongoose = require("mongoose");

const missing = ["MONGO_URL", "JWT_SECRET"].filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing environment variable(s): ${missing.join(", ")}. Copy .env.example to .env and fill them in.`);
  process.exit(1);
}

const app = require("./app");
const { connectRedis } = require("./config/redis");

async function start() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Database connected");

  connectRedis(); // optional - the app works without Redis

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
