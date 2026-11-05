const { createClient } = require("redis");

// Redis is optional: if it is not running, the app keeps working without caching.
const client = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  socket: {
    // try 3 times, then give up instead of retrying forever
    reconnectStrategy: (retries) => (retries >= 3 ? false : 1000),
  },
});

let warned = false;
client.on("error", (err) => {
  if (!warned) {
    warned = true;
    console.warn("Redis unavailable, caching disabled:", err?.code || err?.message);
  }
});
client.on("ready", () => {
  warned = false;
  console.log("Redis connected");
});

function connectRedis() {
  client.connect().catch(() => {});
}

module.exports = { client, connectRedis };
