const jwt = require("jsonwebtoken");
const AuthMiddleware = (req, res, next) => {
  // 1. التحقق من التوكن في الكوكيز
  const cookiesToken = req.cookies?.token;
  // 2. التحقق من التوكن في الهيدر باستخدام Regex دقيق
  const authHeader = req.header("authorization");
  const headerMatch = authHeader ? authHeader.match(/^Bearer\s+(.*)$/i) : null;
  const headerToken = headerMatch ? headerMatch[1] : null; // هذا إذا كنت تستخدم الكوكيز لتخزين التوكن وهو اكثر أماناً في بعض الحالات
  const token = cookiesToken || headerToken;
  // 2. إرجاع الاستجابة في حالة عدم وجود توكن
  if (!token) {
    return res.status(401).json({ error: "no token provided" });
  }
  try {
    // 3. استخدام jwt.verify لفحص التوكن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // يمكن تخزين id المستخدم مباشرة في req.user
    // (إذا كانت الـ payload تحتوي على { id: user._id })
    console.log(decoded);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    console.error("❌ JWT verification error:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Middleware للتأكد من الـ Role (المنظمين فقط)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `hello (${req.user.role}) Access denied. You need to be one of the following roles: ${roles.join(", ")}`,
      });
    }
    next();
  };
};


// 4. تصدير الكود بصيغة CommonJS
module.exports = { AuthMiddleware, authorize };