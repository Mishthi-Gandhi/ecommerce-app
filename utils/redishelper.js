const { client } = require("../config/redis");

// Every helper below is "fail-safe": if Redis is down they quietly do nothing,
// so the app falls back to reading straight from MongoDB.

async function cacheGet(key) {
  if (!client.isReady) return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = 600) {
  if (!client.isReady) return;
  try {
    // the expiry goes in the options object (3rd argument), not inside JSON.stringify
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch {
    /* ignore cache errors */
  }
}

async function cacheDel(key) {
  if (!client.isReady) return;
  try {
    await client.del(key);
  } catch {
    /* ignore cache errors */
  }
}

async function deleteByPrefix(prefix) {
  if (!client.isReady) return;
  try {
    let cursor = "0";
    do {
      const result = await client.scan(cursor, { MATCH: `${prefix}*`, COUNT: 100 });
      cursor = String(result.cursor);
      if (result.keys.length > 0) await client.del(result.keys);
    } while (cursor !== "0");
  } catch {
    /* ignore cache errors */
  }
}

// Call this whenever a product is created, edited, deleted or its stock changes.
// Accepts one id, a list of ids, or nothing (only the product lists are cleared then).
async function invalidateProductCaches(productIds) {
  await deleteByPrefix("products:");
  const ids = [].concat(productIds || []);
  await Promise.all(ids.map((id) => cacheDel(`product:${id}`)));
}

module.exports = { cacheGet, cacheSet, cacheDel, deleteByPrefix, invalidateProductCaches };
