const mongoose = require("mongoose");
const Product = require("../models/product");
const Cart = require("../models/cart");
const AppError = require("../errors/AppError");
const { cacheGet, cacheSet, invalidateProductCaches } = require("../utils/redishelper");
const { deleteUploadedFile } = require("../utils/files");
const { escapeRegex, buildSort, parsePagination } = require("../utils/helpers");
const { PLACEHOLDER_IMAGE } = require("../utils/constants");

async function createProduct(data, imageUrl, userId) {
  const { name, description, price, category, stock } = data;
  const product = await Product.create({
    name, description, price, category, stock,
    image: [imageUrl || PLACEHOLDER_IMAGE],
    createdBy: userId,
  });
  await invalidateProductCaches();
  return product;
}

async function getAllProduct({ search, category, minPrice, maxPrice, inStock, page, limit, sort } = {}) {
  const pagination = parsePagination(page, limit);
  const sortObj = buildSort(sort);

  const query = {};
  if (search) query.name = { $regex: escapeRegex(search), $options: "i" };
  if (category) query.category = category;
  if (minPrice !== undefined && minPrice !== "" && !Number.isNaN(Number(minPrice))) {
    query.price = { ...query.price, $gte: Number(minPrice) };
  }
  if (maxPrice !== undefined && maxPrice !== "" && !Number.isNaN(Number(maxPrice))) {
    query.price = { ...query.price, $lte: Number(maxPrice) };
  }
  if (inStock === "true" || inStock === true) query.stock = { $gt: 0 };

  // the cache key contains EVERY filter, otherwise different searches would share one result
  const cacheKey = `products:${JSON.stringify({ query, sortObj, ...pagination })}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const skip = (pagination.page - 1) * pagination.limit;
  const [products, total] = await Promise.all([
    Product.find(query).sort({ ...sortObj, _id: 1 }).skip(skip).limit(pagination.limit).lean(),
    Product.countDocuments(query),
  ]);
  const result = {
    products,
    total,
    noOfPages: Math.max(1, Math.ceil(total / pagination.limit)),
    currPage: pagination.page,
  };
  await cacheSet(cacheKey, result, 600);
  return result;
}

async function getParticularProduct(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError("Product not found", 404);
  const cached = await cacheGet(`product:${id}`);
  if (cached) return cached;

  const product = await Product.findById(id).lean();
  if (!product) throw new AppError("Product not found", 404);
  await cacheSet(`product:${id}`, product, 600);
  return product;
}

async function getCategories() {
  const cached = await cacheGet("products:categories");
  if (cached) return cached;
  const categories = (await Product.distinct("category")).sort();
  await cacheSet("products:categories", categories, 600);
  return categories;
}

async function updateProduct(id, data, newImageUrl) {
  if (!mongoose.isValidObjectId(id)) throw new AppError("Product not found", 404);
  const product = await Product.findById(id);
  if (!product) throw new AppError("Product not found", 404);

  const { name, description, price, category, stock } = data;
  Object.assign(product, { name, description, price, category, stock });

  let oldImage;
  if (newImageUrl) {
    oldImage = product.image[0];
    product.image = [newImageUrl];
  }
  await product.save();
  if (oldImage) deleteUploadedFile(oldImage);

  await invalidateProductCaches(id);
  return product;
}

async function deleteProduct(id) {
  if (!mongoose.isValidObjectId(id)) throw new AppError("Product not found", 404);
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new AppError("Product not found", 404);

  // remove it from everybody's cart and delete its image file
  await Cart.updateMany({}, { $pull: { products: { productId: product._id } } });
  product.image.forEach(deleteUploadedFile);
  await invalidateProductCaches(id);
}

module.exports = { createProduct, getAllProduct, getParticularProduct, getCategories, updateProduct, deleteProduct };
