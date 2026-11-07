const express = require("express");
const { requireAuth, restrictTo } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const { validate } = require("../middlewares/validation");
const { productSchema } = require("../validators/productValidator");
const {
  handleGetAllProduct, handleGetProductPage, showNewProductForm, showEditProductForm,
  handleCreateProduct, handleUpdateProduct, handleDeleteProduct,
} = require("../controllers/product");

const router = express.Router();
const adminOnly = [requireAuth, restrictTo(["admin"])];

router.get("/", handleGetAllProduct);
router.get("/new", ...adminOnly, showNewProductForm); // must stay above "/:id"
router.post("/", ...adminOnly, upload.single("image"), validate(productSchema), handleCreateProduct);

router.get("/:id", handleGetProductPage);
router.get("/:id/edit", ...adminOnly, showEditProductForm);
router.post("/:id", ...adminOnly, upload.single("image"), validate(productSchema), handleUpdateProduct);
router.post("/:id/delete", ...adminOnly, handleDeleteProduct);

module.exports = router;
