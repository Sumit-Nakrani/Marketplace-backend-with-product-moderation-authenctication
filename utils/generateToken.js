// utils/generateToken.js
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  try {
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    return jwt.sign({ id }, secret, { expiresIn: "30d" });
  } catch (error) {
    console.error("error generating token:", error && error.stack ? error.stack : error);
    return null;
  }
};

module.exports = generateToken;
