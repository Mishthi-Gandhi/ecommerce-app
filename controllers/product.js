const {
  createProduct, getAllProduct, getParticularProduct, getCategories, updateProduct, deleteProduct,
} = require("../services/product");
const asyncHandler = require("../middlewares/asyncHandler");

// multer saves the file; we store the public URL of it (or nothing if no image was chosen)
const imageUrlFrom = (req) => (req.file ? `/uploads/${req.file.filename}` : undefined);

const handleGetAllProduct = asyncHandler(async (req, res) => {
  const { search = "", category = "", minPrice = "", maxPrice = "", inStock = "", sort = "", page, limit } = req.query;
  const filters = { search, category, minPrice, maxPrice, inStock, sort };

  const [result, categories] = await Promise.all([getAllProduct({ ...filters, page, limit }), getCategories()]);

  // query string without "page", used to build the pagination links
  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
  res.render("product", { ...result, categories, filters, qs });
});

// JSON API: GET /api/product?search=&category=&minPrice=&maxPrice=&inStock=&sort=&page=&limit=
const handleGetProductsAPI = asyncHandler(async (req, res) => {
  const result = await getAllProduct(req.query);
  res.json({ ...result, search: req.query.search || "", sort: req.query.sort || "" });
});

const handleGetProductAPI = asyncHandler(async (req, res) => {
  res.json(await getParticularProduct(req.params.id));
});

const handleGetProductPage = asyncHandler(async (req, res) => {
  const product = await getParticularProduct(req.params.id);
  res.render("productDetail", { product });
});

const showNewProductForm = (req, res) => res.render("productForm", { product: null });

const showEditProductForm = asyncHandler(async (req, res) => {
  const product = await getParticularProduct(req.params.id);
  res.render("productForm", { product });
});

const handleCreateProduct = asyncHandler(async (req, res) => {
  await createProduct(req.body, imageUrlFrom(req), req.user.id);
  res.redirect("/product");
});

const handleUpdateProduct = asyncHandler(async (req, res) => {
  await updateProduct(req.params.id, req.body, imageUrlFrom(req));
  res.redirect(`/product/${req.params.id}`);
});

const handleDeleteProduct = asyncHandler(async (req, res) => {
  await deleteProduct(req.params.id);
  res.redirect("/product");
});

module.exports = {
  handleGetAllProduct, handleGetProductsAPI, handleGetProductAPI, handleGetProductPage,
  showNewProductForm, showEditProductForm, handleCreateProduct, handleUpdateProduct, handleDeleteProduct,
};
