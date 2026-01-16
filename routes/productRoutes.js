const express = require("express");
const ProductController = require("../controllers/productControllers");
const { protect,isAdmin } = require("../middleware/auth");

const router = express.Router();


router.post(
  "/",
  protect,
  ProductController.uploadProductImages,
  ProductController.resizeProductImages,
  ProductController.createProduct
);

router.get("/", ProductController.getAllProducts);
router.delete("/:id", protect, ProductController.deleteProduct);
router.put(
  "/:id",
  protect,
  ProductController.uploadProductImages,
  ProductController.updateProduct
);
router.get("/admin", protect, isAdmin, ProductController.getAllProductsForAdmin);

// Admin: approve / reject product
router.patch("/:id/approve", protect, isAdmin,ProductController.approveProduct);
router.patch("/:id/reject", protect, isAdmin, ProductController.rejectProduct);

module.exports = router;
