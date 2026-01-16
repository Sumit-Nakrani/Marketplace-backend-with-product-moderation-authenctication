const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const UserController = require("../controllers/userController");
const  {sendTestMail} = require("../controllers/emailController");
const {
  validateRegister,
  validateLogin,
} = require("../validation/uservalidation");

// User Auth
router.post("/register", validateRegister, UserController.registerUser);
router.post("/login", validateLogin, UserController.loginUser);

// Profile
router.get("/profile", authMiddleware.protect, UserController.getUserProfile);

// Delete user image
router.delete(
  "/profile/delete",
  authMiddleware.protect,
  UserController.deleteUserImage
);

// Replace user image
router.patch(
  "/profile/image",
  authMiddleware.protect,
  UserController.uploadUserImage, 
  UserController.resizeUserImage, 
  UserController.replaceUserImage 
);


router.post("/send-mail", sendTestMail);

module.exports = router;
