const SORT_FIELDS = ["price", "name", "createdAt"];

// Escape user text before putting it in a RegExp (prevents regex injection / ReDoS)
function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// "price_desc" -> { price: -1 }. Only whitelisted fields are allowed.
function buildSort(sort) {
  const [field, direction] = String(sort || "").split("_");
  if (!SORT_FIELDS.includes(field)) return { createdAt: -1 };
  return { [field]: direction === "desc" ? -1 : 1 };
}

function parsePagination(page, limit, { defaultLimit = 9, maxLimit = 50 } = {}) {
  let p = parseInt(page, 10);
  let l = parseInt(limit, 10);
  if (!Number.isInteger(p) || p < 1) p = 1;
  if (!Number.isInteger(l) || l < 1) l = defaultLimit;
  if (l > maxLimit) l = maxLimit;
  return { page: p, limit: l };
}

function cartTotal(cart) {
  if (!cart) return 0;
  return cart.products.reduce((sum, item) => sum + item.quantity * item.productId.price, 0);
}

module.exports = { escapeRegex, buildSort, parsePagination, cartTotal, SORT_FIELDS };
