const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const path = require("path");
const smsRoute = require("./routes/smsRoute");

dotenv.config();
connectDB();

const app = express();

// parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// serve uploaded images
app.use("/public", express.static(path.join(__dirname, "public")));

// routes
const userRoute = require("./routes/userRoute");
const productRoutes = require("./routes/productRoutes");

app.use("/api", userRoute);
app.use("/api/product", productRoutes);

app.get("/", (req, res) => {
  res.send("api is running...");
});

// example listing (you can keep or move)
const Product = require("./models/product");
app.get("/api/product-list", async (req, res) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    console.log("Page:", page, "Limit:", limit, "Skip:", skip);

    const products = await Product.find({})
      .sort({ _id: 1 })
      .skip(skip)
      .limit(limit);

    console.log("Fetched:", products.length);

    const total = await Product.countDocuments();
    res.json({
      totalItems: total,
      currentPage: page,
      perPage: limit,
      products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

const multerErrorHandler = require("./middleware/uploadErrorHandler"); 
const errorhandler = require("./middleware/errormiddleware"); 

app.use(multerErrorHandler);
app.use(errorhandler);

app.use("/api/sms", smsRoute);

// MySQL Test Route
app.post("/add", (req, res) => {
  const { name, email } = req.body;
  db.query(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    [name, email],
    (err) => {
      if (err) return res.send(err);
      res.send("User Added Successfully");
    }
  );
});


app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, data) => {
    if (err) return res.send(err);
    res.json(data);
  });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("server is running on port", PORT));
