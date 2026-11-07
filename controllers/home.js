const { getAllProduct, getCategories } = require("../services/product");
const asyncHandler = require("../middlewares/asyncHandler");

const handleHome = asyncHandler(async (req, res) => {
  const [{ products }, categories] = await Promise.all([
    getAllProduct({ limit: 6, sort: "createdAt_desc" }),
    getCategories(),
  ]);
  res.render("home", { products, categories });
});

module.exports = { handleHome };
