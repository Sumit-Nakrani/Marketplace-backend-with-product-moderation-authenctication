const User = require("../models/user");
const generateToken = require("../utils/generateToken");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
// ========================
// Multer config
// ========================
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed!"), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadUserImage = upload.single("image");

// ========================
// Resize profile image
// ========================
exports.resizeUserImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const mediaPath = path.join(__dirname, "../public/user");
    if (!fs.existsSync(mediaPath)) fs.mkdirSync(mediaPath, { recursive: true });

    const filename = `user-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(300, 300) // fixed thumbnail-size
      .jpeg({ quality: 85 })
      .toFile(path.join(mediaPath, filename));

    req.file.filename = filename;
    next();
  } catch (err) {
    res.status(500).json({ status: false, message: "Image processing failed", error: err.message });
  }
};

// ========================
// Register
// ========================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ status: false, message: "User already exists" });
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({
      status: true,
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      res.json({ status: true, message: "Login successful", token });
    } else {
      res.status(401).json({ status: false, message: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


// Get Profile
// ========================
exports.getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      image: req.user.image ? `/user/${req.user.image}` : null,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ========================
// Replace Profile Image
// ========================
exports.replaceUserImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!req.file) {
      return res.status(400).json({ message: "No new image uploaded" });
    }

    // delete old if exists
    if (user.image) {
      const oldPath = path.join(__dirname, "../public/user", user.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    user.image = req.file.filename;
    await user.save();

    res.json({
      status: true,
      message: "Profile image replaced successfully",
      image: `/user/${user.image}`,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ========================
// Delete User Image
// ========================
exports.deleteUserImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.image) {
      const filePath = path.join(__dirname, "../public/user", user.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      user.image = undefined;
      await user.save();
    }

    res.json({ status: true, message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

