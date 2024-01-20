import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import pincodeRoutes from "./routes/pincodeRoutes.js";
// import paymentRoutes from "./routes/paymentRoute.js";
import bannerRoute from "./routes/bannerRoute.js";
import formidable from "express-formidable";
import razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";

import cors from "cors";

//configure env
dotenv.config();

//databse config
connectDB();

//rest object
const app = express();

//middelwares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(formidable());

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/pincode", pincodeRoutes);
app.use("/api/v1/banner", bannerRoute);
// app.use("/api/v1/payment", paymentRoutes);

const instance = new razorpay({
  key_id: process.env.KEY,
  key_secret: process.env.SECRET,
});

const paymentschema = new mongoose.Schema({
  razorpay_order_id: {
    type: String,
    required: true,
  },
  razorpay_payment_id: {
    type: String,
    required: true,
  },
  razorpay_signature: {
    type: String,
    required: true,
  },
});

const Payment = mongoose.model("Payment", paymentschema);

app.post("/checkout", async (req, res) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };
  const order = await instance.orders.create(options);
  console.log(order);
  res.status(200).json({
    success: true,
    order,
  });
});

// payemnt verification
app.post("/paymentverification", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedsgnature = crypto
    .createHmac("sha256", process.env.SECRET)
    .update(body.toString())
    .digest("hex");
  const isauth = expectedsgnature === razorpay_signature;
  if (isauth) {
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    res.redirect(
      `http://localhost:5173/paymentsuccess?reference=${razorpay_payment_id}`
    );
  } else {
    res.status(400).json({ success: false });
  }
});

app.get("/api/getkey", (req, res) => {
  return res.status(200).json({ key: process.env.KEY });
});

//rest api
app.get("/", (req, res) => {
  res.send("<h1>Welcome to ecommerce app</h1>");
});

//PORT
const PORT = process.env.PORT || 8080;

//run listen
app.listen(PORT, () => {
  console.log(
    `Server Running on ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan
      .white
  );
});
