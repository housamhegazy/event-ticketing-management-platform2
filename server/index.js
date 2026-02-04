const express = require('express')
const bodyParser = require("body-parser"); // لاستخدامها لقراءة JSON من الطلبات
const mongoose = require("mongoose");
const cors = require("cors"); // للسماح لـ frontend بالاتصال بـ backend
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express()
const port = process.env.PORT || 3000;
// ********************** Middleware **********************
app.use(cookieParser()); // خاصه بقراءة الكوكيز من الطلبات ولازم تتواجد قبل اي روت
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
); // تفعيل CORS للسماح لـ frontend (الذي يعمل على منفذ مختلف) بالاتصال بـ backend
app.use(express.json()); // عشان السيرفر يفهم الـ JSON اللي جاي من الفرونت

//============================ Routes =============================
const userRoutes = require("./routes/user.js");
const createEventRoute = require("./routes/createEventRoute.js");
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use("/api/users", userRoutes);
app.use("/api/events", createEventRoute);
// ********************** Database & Server Start **********************
const mongoURI = process.env.MONGODB_URI ;

mongoose.connect(mongoURI)
  .then(() => {
    console.log("✅ Connected to MongoDB!");
    // مش هنشغل السيرفر إلا لما الداتابيز تشبك
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Could not connect to MongoDB...", err);
  });