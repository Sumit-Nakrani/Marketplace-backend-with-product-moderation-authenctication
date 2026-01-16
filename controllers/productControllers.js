const Product = require("../models/product");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { log } = require("console");

// ========== Multer config ==========
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed!"), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// Allow max 4 images
exports.uploadProductImages = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "thumbnails", maxCount: 4 },
]);
exports.resizeProductImages = async (req, res, next) => {
  try {
    if (!req.files) return next();
    const mediaPath = path.join(__dirname, "../public/products");
    if (!fs.existsSync(mediaPath)) fs.mkdirSync(mediaPath, { recursive: true });

    // Prepare containers
    req.body.image = null;
    req.body.thumbnails = [];

    // ==== Main Image ====
    if (req.files.image) {
      const file = req.files.image[0];
      const filename = `product-${Date.now()}-main.jpeg`;

      await sharp(file.buffer)
        .jpeg({ quality: 85 })
        .toFile(path.join(mediaPath, filename));
      req.body.image = filename;
    }

    // ==== Thumbnails ====
    if (req.files.thumbnails) {
      await Promise.all(
        req.files.thumbnails.map(async (file, i) => {
          const filename = `product-${Date.now()}-thumb-${i + 1}.jpeg`;

          await sharp(file.buffer)
            .resize(300, 300)
            .jpeg({ quality: 70 })
            .toFile(path.join(mediaPath, filename));

          req.body.thumbnails.push(filename);
        })
      );
    }
    next();
  } catch (err) {
    console.error("Resize Error:", err.message);
    res.status(500).json({
      status: false,
      message: "Image processing failed",
      error: err.message,
    });
  }
};
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountprice,
      brand,
      color,
      size,
      stock,
      category,
      warranty,
      returnpolicy,
      ratingavg,
      currency,
    } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      discountprice,
      brand,
      stock,
      color: color ? color.split(",") : [],
      size: size ? size.split(",") : [],
      category,
      warranty,
      returnpolicy,
      ratingavg,
      currency,

      image: req.body.image,
      thumbnails: req.body.thumbnails || [],
      user: req.user._id,
    });

    res.status(201).json({
      status: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error in createProduct:", error.message);
    res.status(500).json({
      status: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = {}; 

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email"),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      status: true,
      totalItems: total,
      totalPages,
      currentPage: page,
      perPage: limit,
      products,
    });
  } catch (err) {
    console.error("Error in getAllProducts:", err && err.stack ? err.stack : err);
    res.status(500).json({
      status: false,
      message: "Failed to fetch products",
      error: err && err.message ? err.message : String(err),
    });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      brand,
      discountprice,
      category,
      color,
      stock,
      size,
      warranty,
      returnpolicy,
      ratingavg,
      currency,
    } = req.body;
    let { deleteThumbnails } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    if (
      !req.user.isAdmin &&
      product.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: false,
        message: "Not authorized to update this product",
      });
    }

    const mediaPath = path.join(process.cwd(), "public/products");
    if (!fs.existsSync(mediaPath)) fs.mkdirSync(mediaPath, { recursive: true });

    let thumbnailsToDelete = [];
    if (deleteThumbnails) {
      if (Array.isArray(deleteThumbnails)) {
        thumbnailsToDelete = deleteThumbnails;
      } else if (typeof deleteThumbnails === "string") {
        try {
          thumbnailsToDelete = JSON.parse(deleteThumbnails); // if JSON array string
        } catch {
          thumbnailsToDelete = [deleteThumbnails]; // if plain string
        }
      }
    }

    if (thumbnailsToDelete.length > 0) {
      console.log(" Thumbnails to delete:", thumbnailsToDelete);

      const folderFiles = fs.readdirSync(mediaPath);

      thumbnailsToDelete.forEach((thumbFragment) => {
        if (!thumbFragment) return;
        const cleanFragment = thumbFragment.trim();

        const matchedFile = folderFiles.find((fname) =>
          fname.includes(cleanFragment)
        );

        if (matchedFile) {
          const filePath = path.join(mediaPath, matchedFile);
          fs.unlinkSync(filePath);
          console.log(`✅ Deleted: ${filePath}`);

          product.thumbnails = product.thumbnails.filter(
            (f) => f !== matchedFile
          );
        } else {
          console.log(`No match found for: ${cleanFragment}`);
        }
      });
    }

    //  Update basic fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.brand = brand || product.brand;
    product.discountprice = discountprice
      ? Number(discountprice)
      : product.discountprice;
    product.category = category || product.category;
    product.color = color ? color.split(",") : product.color;
    product.stock =
      stock !== undefined ? stock === "true" || stock === true : product.stock;
    product.size = size ? size.split(",") : product.size;
    product.warranty = warranty || product.warranty;
    product.returnpolicy = returnpolicy || product.returnpolicy;
    product.ratingavg = ratingavg ? Number(ratingavg) : product.ratingavg;
    product.currency = currency || product.currency;

    // Replace main image if new uploaded
    if (req.files && req.files.image) {
      if (product.image) {
        const oldMain = path.join(mediaPath, product.image);
        if (fs.existsSync(oldMain)) fs.unlinkSync(oldMain);
      }

      const file = req.files.image[0];
      const filename = `product-${Date.now()}-main.jpeg`;

      await sharp(file.buffer)
        .jpeg({ quality: 85 })
        .toFile(path.join(mediaPath, filename));

      product.image = filename;
    }

    //  Add new thumbnails if given
    if (req.files && req.files.thumbnails && req.files.thumbnails.length > 0) {
      const newThumbs = [];
      await Promise.all(
        req.files.thumbnails.map(async (file, i) => {
          const thumbname = `product-${Date.now()}-thumb-${i + 1}.jpeg`;
          await sharp(file.buffer)
            .resize(300, 300)
            .jpeg({ quality: 70 })
            .toFile(path.join(mediaPath, thumbname));
          newThumbs.push(thumbname);
        })
      );
      product.thumbnails = [...product.thumbnails, ...newThumbs];
    }

    //  Save updated product
    await product.save();

    res.json({
      status: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error in updateProduct:", error.message);
    res.status(500).json({
      status: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    if (
      req.user.isAdmin ||
      product.user.toString() === req.user._id.toString()
    ) {
      const mediaPath = path.join(__dirname, "../public/products");

      //  Delete main image (handle string or array)
      if (product.image) {
        if (Array.isArray(product.image)) {
          product.image.forEach((img) => {
            const filePath = path.join(mediaPath, img);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          });
        } else {
          const filePath = path.join(mediaPath, product.image);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      }

      //  Delete thumbnails (array of strings)
      if (product.thumbnails && product.thumbnails.length > 0) {
        product.thumbnails.forEach((thumb) => {
          const filePath = path.join(mediaPath, thumb);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      }

      await product.deleteOne();
      return res.json({
        status: true,
        message: "Product deleted successfully",
      });
    } else {
      return res.status(403).json({
        status: false,
        message: "Not authorized to delete this product",
      });
    }
  } catch (error) {
    console.error("Error in deleteProduct:", error.message);
    res.status(500).json({
      status: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ status: false, message: "Product not found" });

    const note = (req.body && (req.body.note || req.body.reason)) || "approve by admin";

    product.isApproved = true;
    product.status = "approved";
    product.adminNote = note;
    await product.save();

    res.json({ status: true, message: "Product approved", product });
  } catch (err) {
    console.error("Error in approveProduct:", err && err.stack ? err.stack : err);
    res.status(500).json({ status: false, message: err.message || "Server error" });
  }
};

exports.rejectProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ status: false, message: "Product not found" });

    const note = (req.body && (req.body.note || req.body.reason)) || "Rejected by admin";

    product.isApproved = false;
    product.status = "rejected";
    product.adminNote = note;
    await product.save();

    res.json({ status: true, message: "Product rejected", product });
  } catch (err) {
    console.error("Error in rejectProduct:", err && err.stack ? err.stack : err);
    res.status(500).json({ status: false, message: err.message || "Server error" });
  }
};

exports.getAllProductsForAdmin = async (req, res) => {
  try {
    const { status, userId, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;   
    if (userId) filter.user = userId;

    const pageNum = Math.max(1, Number(page));
    const perPage = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * perPage;

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .populate("user", "name email")
    ]);

    const totalPages = Math.ceil(total / perPage);

    res.json({
      status: true,
      totalItems: total,
      totalPages,
      currentPage: pageNum,
      perPage,
      products
    });
  } catch (err) {
    console.error("Error in getAllProductsForAdmin:", err && err.stack ? err.stack : err);
    res.status(500).json({ status: false, message: err && err.message ? err.message : "Server error" });
  }
};