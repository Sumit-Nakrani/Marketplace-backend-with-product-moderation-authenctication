const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { request } = require("express");



exports.protect = async (req, res, next) => {
  try {
    let token;

    console.log("------ PROTECT MIDDLEWARE START ------");
    console.log("Headers incoming:", req.headers);

    // 1) Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2) Check cookie (requires cookie-parser)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // LOG 1 — Token mila ya nahi
    console.log("TOKEN FOUND:", token);

    if (!token) {
      console.log("❌ No token found.");
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // 3) Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret_key"
    );

    // LOG 2 — Token payload
    console.log("DECODED PAYLOAD:", decoded);

    // 4) Find user
    const user = await User.findById(decoded.id).select("-password");

    // LOG 3 — User mila ya nahi
    console.log("USER FOUND:", user);

    if (!user) {
      console.log("❌ User not found in DB");
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;

    // LOG 4 — isAdmin value
    console.log("USER isAdmin:", user.isAdmin);

    console.log("------ PROTECT MIDDLEWARE END ------\n");

    next();
  } catch (err) {
    console.log("❌ PROTECT ERROR:", err.message);
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
};
exports.isAdmin = (req, res, next) => {

  if (!req.user){ return res.status(401).json({ message: "Not authenticated" });}
  console.log("User Data :::>", req.user.isAdmin)
  if (!req.user.isAdmin) {return res.status(403).json({ message: "Admin only" });}
  next();
};