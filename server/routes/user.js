const express = require("express");
const router = express.Router();
const User = require("../models/userSchema.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Event = require("../models/eventSchema.js");
const {
  cloudinary,
  bufferToDataUri,
  upload,
} = require("../utils/cloudinary.js");
const {
  AuthMiddleware,
  authorize,
} = require("../middleware/AuthMiddleware.js");

// dont forget to npm install cookie-parser in backend
// protected route to set auth cookie
function setAuthCookie(res, token) {
  // إعداد الكوكيز مع الخيارات المناسبة
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 أسبوع
  });
}


router.post("/register", async (req, res) => {
  // Handle user registration
  try {
    const { username, email, password, role } = req.body;

    // تأكد إن الـ role اللي مبعوث صح (أمان إضافي)
    const validRoles = ["user", "organizer"];
    const userRole = validRoles.includes(role) ? role : "user";

    // تحقق مما إذا كان المستخدم موجودًا بالفعل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // تحقق مما إذا كان اسم المستخدم موجودًا بالفعل
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // إنشاء مستخدم جديد

    const hashedPassword = await bcrypt.hash(password, 10); // 10 مستوى صعوبة التشفير
    const NewUser = new User({
      username,
      email,
      password: hashedPassword,
      role: userRole,
    });
    // حفظ المستخدم في قاعدة البيانات
    await NewUser.save();

    // إنشاء وتوقيع JWT
    const token = jwt.sign(
      { id: NewUser._id, role: NewUser.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );
    setAuthCookie(res, token);

    res.status(201).json({
      message: "user registered successfully",
      token,
      user: {
        id: NewUser._id,
        username: NewUser.username,
        email: NewUser.email,
        avatar: NewUser.avatar,
        role: NewUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  // Handle user login
  try {
    const { email, password } = req.body;
    // البحث عن المستخدم في قاعدة البيانات
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // تحقق من صحة كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // إنشاء وتوقيع JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );
    setAuthCookie(res, token);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/profile", AuthMiddleware, async (req, res) => {
  // Protected route to get user profile
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/logout", (req, res) => {
  // Handle user logout by clearing the auth cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

//edit user profile (user and organizer => can edit their username,email,avatar,role)
router.put(
  "/edit-profile",
  AuthMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const { username, email, role } = req.body;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // 1. حفظ الـ Role القديم قبل التعديل للمقارنة
      const oldRole = user.role;
      let finalRole = user.role;

      // 🛡️ حماية وتحديد الـ Role الجديد
      if (
        role &&
        (role === "user" || role === "organizer") &&
        user.role !== "admin"
      ) {
        finalRole = role;
      }

      let avatarUrl = user.avatar;
      if (req.file) {
        if (user.avatar && !user.avatar.includes("default")) {
          const publicId = user.avatar.split("/").slice(-2).join("/").split(".")[0];
          await cloudinary.uploader.destroy(publicId).catch(() => console.log("Delete old avatar failed"));
        }
        const fileUri = bufferToDataUri(req.file.mimetype, req.file.buffer);
        const uploadResult = await cloudinary.uploader.upload(fileUri, {
          folder: "avatars",
          resource_type: "auto",
        });
        avatarUrl = uploadResult.secure_url;
      }

      // 2. تحديث البيانات (تأكد من تمرير role: finalRole)
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { username, email, avatar: avatarUrl, role: finalRole },
        { new: true, select: "username email avatar role" }
      );

      // 3. الشرط السحري: هل الـ Role اتغير؟
      if (oldRole !== finalRole) {
        // مسح الكوكيز من السيرفر
        res.clearCookie("token", {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });

        // نبعت رسالة واضحة للفرونت إند إن حصل Logout
        return res.json({
          message: "Role updated. Please login again.",
          requiresLogout: true, // علامة للفرونت إند
          user: updatedUser
        });
      }

      // لو مفيش تغيير في الـ Role، بنرجع البيانات عادي
      res.json(updatedUser);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);
//get all organizers and users who registered in the platform for admin
router.get(
  "/all-users",
  AuthMiddleware,
  authorize("admin"),
  async (req, res) => {
    try {
      const users = await User.find().select("username email role createdAt");
      //dont show admin info in the users list
      const filteredUsers = users.filter((user) => user.role !== "admin");
      res.json(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Server error while fetching users" });
    }
  },
);

//delete user from the platform by admin
router.delete(
  "/delete-user/:id",
  AuthMiddleware,
  authorize("admin"),
  async (req, res) => {
    try {
      const userId = req.params.id;
      // تحقق مما إذا كان المستخدم موجودًا
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //delete events created by the user if organizer
      if (user.role === "organizer") {
        //delete images from cloudinary
        const userEvents = await Event.find({ organizer: userId });
        for (const event of userEvents) {
          if (event.image && !event.image.includes("default")) {
            const publicId = event.image
              .split("/")
              .slice(-2)
              .join("/")
              .split(".")[0];
            await cloudinary.uploader
              .destroy(publicId)
              .catch((err) => console.log("Delete event image failed"));
          }
        }
        await Event.deleteMany({ organizer: userId });
      }
      
      // delete user avatar from cloudinary if exists
      if (user.avatar && !user.avatar.includes("default")) {
        const publicId = user.avatar
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        await cloudinary.uploader
          .destroy(publicId)
          .catch((err) => console.log("Delete user avatar failed"));
      }

      await User.findByIdAndDelete(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Server error while deleting user" });
    }
  },
);
// edit user role by admin
router.put(
  "/update-user/:id",
  AuthMiddleware,
  authorize("admin"),
  async (req, res) => {
    try {
      const userId = req.params.id;
      const { role } = req.body;
      const validRoles = ["user", "organizer"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
      }
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, select: "username email role" },
      );
      res.json({
        message: "User role updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      res
        .status(500)
        .json({ message: "Server error while updating user role" });
    }
  },
);

// delete user profile by user himself
router.delete(
  "/delete-profile",
  AuthMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;
      // تحقق مما إذا كان المستخدم موجودًا
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //delete events created by the user if organizer
      if (user.role === "organizer") {
        //delete images associated with the events
        const events = await Event.find({ organizer: userId });
        for (const event of events) {
          if (event.image && !event.image.includes("default")) {
            const publicId = event.image.split("/").slice(-2).join("/").split(".")[0];
            await cloudinary.uploader.destroy(publicId).catch((err) => console.log("Delete event image failed"));
          }
        }
        await Event.deleteMany({ organizer: userId });
      }
      // delete user avatar from cloudinary if exists
      if (user.avatar && !user.avatar.includes("default")) {
        const publicId = user.avatar
          .split("/")
          .slice(-2)
          .join("/")  
          .split(".")[0];
        await cloudinary.uploader
          .destroy(publicId)
          .catch((err) => console.log("Delete user avatar failed"));
      }
      await User.findByIdAndDelete(userId);
      res.json({ message: "User profile deleted successfully" });
    }
    catch (error) {
      console.error("Error deleting user profile:", error);
      res.status(500).json({ message: "Server error while deleting user profile" });
    }
  },
);

module.exports = router;
