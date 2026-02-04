const cloudinary = require("cloudinary").v2
require("dotenv").config();
const multer = require("multer");

// يجب أن تكون هذه الأسطر في ملف server.js أو ملف إعداد Cloudinary الخاص بك
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // يفضل استخدام HTTPS
});
// نستخدم MemoryStorage لتخزين الملف في ذاكرة الخادم مؤقتاً كـ Buffer
const storage = multer.memoryStorage();
// ⭐️ 2. إعداد Multer
const upload = multer({ storage: storage });

// الدالة المساعدة لتحويل Buffer إلى Data URI
const bufferToDataUri = (mimetype, buffer) => {
  const b64 = buffer.toString('base64');
  return `data:${mimetype};base64,${b64}`;
};

module.exports = {cloudinary,bufferToDataUri,upload};