const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    discountprice: { type: Number },
    brand: { type: String },
    category: { type: String },
    color: [String ],
    stock: { type: Number, default: 0 },
    size: [String ],
    warranty: { type: String },
    returnpolicy: { type: String },
    ratingavg: { type: Number, default: 0 },
    currency: { type: String, default:'INR' },
    image: [{ type: String }],
    thumbnails: [{ type: String }], // store thumbnails in array
    user: {
      type: mongoose.Schema.Types.ObjectId, // kis user ne add kiya
      ref: "User",
      required: true,
    },
    isApproved:{type:Boolean,default:false},
    status:{type:String,enum: ["pending", "approved", "rejected"], default: "pending"},
    adminNote:{type:String},
    createdAt:{type:Date,default:Date.now}
  },
  { timestamps: true }
);



module.exports = mongoose.model("Product", productSchema);
