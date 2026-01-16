const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { string } = require("joi");
const { isAdmin } = require("../middleware/auth");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: "" },
      isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new error("password failed");
  }
};

module.exports = mongoose.model("User", userSchema);
