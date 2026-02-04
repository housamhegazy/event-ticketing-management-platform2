const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "يجب إدخال عنوان للفعالية"], 
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, "يجب إضافة وصف للفعالية"] 
  },
  category: { 
    type: String, 
    required: true,
    enum: ["Music", "Sports", "Education", "Technology", "Other"] // تصنيفات للبحث
  },
  location: { 
    type: String, 
    required: [true, "يجب تحديد مكان الفعالية (أو رابط لو أونلاين)"] 
  },
  date: { 
    type: Date, 
    required: [true, "يجب تحديد موعد الفعالية"] 
  },
  price: { 
    type: Number, 
    default: 0 // لو 0 تبقى الفعالية مجانية
  },
  capacity: { 
    type: Number, 
    required: [true, "حدد أقصى عدد للحضور"] 
  },
  availableSeats: { 
    type: Number ,
    // ملاحظة: سيتم مساواتها بالـ capacity عند الإنشاء
    default: function() {
      return this.capacity;
    }
  },
  image: { 
    type: String, 
    default: "default-event.jpg" // رابط الصورة (Cloudinary لاحقاً)
  },
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // ربط الفعالية بالمنظم اللي أنشأها
    required: true 
  },
  attendees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // ربط بكل مستخدم قام بالحجز
    }
  ],
  isPublished: { 
    type: Boolean, 
    default: true // عشان المنظم يقدر يخفي الفعالية لو حب
  }
}, { timestamps: true }); // بيضيف أوتوماتيك createdAt و updatedAt


module.exports = mongoose.model('Event', eventSchema);