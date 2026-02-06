const express = require("express");
const router = express.Router();
const User = require("../models/userSchema.js");
const {
  AuthMiddleware,
  authorize,
} = require("../middleware/AuthMiddleware.js");
const Event = require("../models/eventSchema.js");
const {
  cloudinary,
  bufferToDataUri,
  upload,
} = require("../utils/cloudinary.js");

router.get("/", AuthMiddleware, authorize("organizer"), (req, res) => {
  res.send("Create Event Route is working");
});
// create event route only for organizer
router.post(
  "/create-event",
  AuthMiddleware,
  authorize("organizer"),
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        price,
        capacity,
        availableSeats,
        isPublished,
        date,
        location,
      } = req.body;
      const organizerId = req.user.id;
      let image = null;
      // إذا تم تحميل صورة، قم برفعها إلى Cloudinary
      if (req.file) {
        const file = bufferToDataUri(req.file.mimetype, req.file.buffer);
        const result = await cloudinary.uploader.upload(file, {
          folder: "events_images",
        });
        image = result.secure_url;
      }
      // تحقق مما إذا كان المستخدم هو منظم
      const user = await User.findById(organizerId);
      if (!user || user.role !== "organizer") {
        return res.status(403).json({
          message: "Access denied. Only organizers can create events.",
        });
      }
      // إنشاء الفعالية الجديدة
      const newEvent = new Event({
        title,
        description,
        category,
        location,
        date,
        price,
        capacity,
        availableSeats: capacity, // تعيين availableSeats مساوية لـ capacity عند الإنشاء
        image: image, // هنا بنخزن رابط الـ Cloudinary ✅
        organizer: organizerId,
        isPublished,
      });
      await newEvent.save();
      res
        .status(201)
        .json({ message: "Event created successfully", event: newEvent });
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Server error while creating event" });
    }
  },
);

// get all events created by the organizer to edit and delete
router.get(
  "/my-events",
  AuthMiddleware,
  authorize("organizer"),
  async (req, res) => {
    try {
      const organizerId = req.user.id;
      const events = await Event.find({ organizer: organizerId }).populate(
        "organizer",
        "username",
      );

      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Server error while fetching events" });
    }
  },
);
//get event details by id to anyone
router.get("/event/:id", AuthMiddleware, async (req, res) => {
  const organizerId = req.user.id;
  const eventId = req.params.id;
  try {
    const event = await Event.findOne({ _id: eventId });
    if (!event) {
      return res
        .status(404)
        .json({ message: "Event not found or unauthorized access." });
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Server error while fetching event" });
  }
});
// get all events in home page to organizer and user and not user before login
router.get("/all-events", async (req, res) => {
  try {
    const events = await Event.find({ isPublished: true }).populate(
      "organizer",
      "username",
    );
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error while fetching events" });
  }
});

// delete event only by organizer or admin
router.delete(
  "/delete-event/:id",
  AuthMiddleware,
  authorize("organizer", "admin"),
  async (req, res) => {
    try {
      const eventId = req.params.id;
      const organizerId = req.user.id;
      const isAdmin = req.user.role === "admin";
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.organizer.toString() !== organizerId && !isAdmin) {
        return res.status(403).json({
          message: "Access denied. You can only delete your own events.",
        });
      }

      // delete event from cloudinary if needed (not implemented here)
      if (event.image) {
        const parts = event.image.split("/");
        const folderName = parts[parts.length - 2]; // سيأخذ 'events_images'
        const fileNameWithExtension = parts[parts.length - 1]; // سيأخذ 'id.jpg'
        const publicId = `${folderName}/${fileNameWithExtension.split(".")[0]}`;
        console.log("Deleting Image with ID:", publicId); // عشان تتأكد في الـ Terminal
        await cloudinary.uploader.destroy(publicId);
      }
      // delete event from database
      await Event.findByIdAndDelete(eventId);
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Server error while deleting event" });
    }
  },
);
// search events by title or category by anyone
router.get("/search", async (req, res) => {
  try {
    const { title, category } = req.query;
    const query = {};
    if (title) {
      query.title = { $regex: title, $options: "i" };
    }
    if (category) {
      query.category = { $regex: category, $options: "i" };
    }
    const events = await Event.find({ ...query, isPublished: true });
    res.json(events);
  } catch (error) {
    console.error("Error searching events:", error);
    res.status(500).json({ message: "Server error while searching events" });
  }
});
// update event by organizer who created it
router.put(
  "/update-event/:id",
  AuthMiddleware,
  authorize("organizer"),
  upload.single("image"),
  async (req, res) => {
    try {
      const eventId = req.params.id;
      const organizerId = req.user.id;
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (event.organizer.toString() !== organizerId) {
        return res.status(403).json({
          message: "Access denied. You can only update your own events.",
        });
      }
      // Update event fields
      const {
        title,
        description,
        category,
        location,
        date,
        price,
        capacity,
        isPublished,
      } = req.body;
      event.title = title;
      event.description = description;
      event.category = category;
      event.location = location;
      event.date = date;
      event.price = price;
      event.capacity = capacity;
      event.availableSeats = capacity; // تحديث availableSeats لتساوي capacity
      event.isPublished = isPublished;

      // Update image if provided
      if (req.file) {
        // delete old image from cloudinary if needed (not implemented here)
        if (event.image) {
          const parts = event.image.split("/");
          const folderName = parts[parts.length - 2]; // سيأخذ 'events_images'
          const fileNameWithExtension = parts[parts.length - 1]; // سيأخذ 'id.jpg'
          const publicId = `${folderName}/${fileNameWithExtension.split(".")[0]}`;

          console.log("Deleting Image with ID:", publicId); // عشان تتأكد في الـ Terminal
          await cloudinary.uploader.destroy(publicId);
        }
        // upload new image to cloudinary
        // رفع الصورة الجديدة (التعديل هنا ✅)
        const fileUri = bufferToDataUri(req.file.mimetype, req.file.buffer);
        const result = await cloudinary.uploader.upload(fileUri, {
          folder: "events_images",
        });
        event.image = result.secure_url;
      }

      await event.save();

      res.json({ message: "Event updated successfully", data: event });
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Server error while updating event" });
    }
  },
);

//book event here  for user and organizer
router.post("/book-event/:id", AuthMiddleware, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() === userId) {
      return res
        .status(400)
        .json({ message: "You cannot book your own event" });
    }
    if (event.availableSeats <= 0) {
      return res
        .status(400)
        .json({ message: "No available seats for this event" });
    }
    // منع الشخص للحجز اكتر من مره
    const user = await User.findById(userId);
    if (user.bookedEvents && user.bookedEvents.includes(eventId)) {
      return res
        .status(400)
        .json({ message: "You have already booked this event" });
    }
    // 4. عملية الحجز (Atomic Update)
    // بنستخدمfindOneAndUpdate عشان نضمن إن لو 100 واحد داسوا في نفس اللحظة، السيرفر ميسجلش أكتر من السعة
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gt: 0 } }, // شرط: لازم يكون فيه مكان
      { $inc: { availableSeats: -1 }, $push: { attendees: req.user.id } }, // اطرح 1 من المقاعد المتاحة وضيف اليوزر لقائمة الحضور ✅
      { new: true }, // رجع البيانات الجديدة بعد التعديل
    );

    if (!updatedEvent) {
      return res.status(400).json({ message: "عذراً، نفدت المقاعد للتو!" });
    }
    // إضافة eventId إلى قائمة bookedEvents للمستخدم
    await User.findByIdAndUpdate(userId, {
      $addToSet: { bookedEvents: eventId },
    });
    res.json({ message: "Event booked successfully", event: updatedEvent });
  } catch (error) {
    console.error("Error booking event:", error);
    res.status(500).json({ message: "Server error while booking event" });
  }
});

//cancel booking event for user and organizer
router.post("/cancel-booking/:id", AuthMiddleware, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the user has booked this event
    const user = await User.findById(userId);
    if (!user.bookedEvents.includes(eventId)) {
      return res.status(400).json({ message: "You haven't booked this event" });
    }

    // Update event available seats
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $inc: { availableSeats: 1 }, $pull: { attendees: userId } },

      { new: true },
    );

    // Remove event from user's bookedEvents list
    await User.findByIdAndUpdate(userId, { $pull: { bookedEvents: eventId } });

    res.json({
      message: "Booking cancelled successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server error while cancelling booking" });
  }
});

//get events i have booked for user and organizer
router.get("/my-booked-events", AuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. هنجيب اليوزر عشان نعرف الـ IDs اللي حجزها
    const user = await User.findById(userId).select("bookedEvents");

    if (!user || !user.bookedEvents || user.bookedEvents.length === 0) {
      return res.json([]); // لو محجزش حاجة نرجع مصفوفة فاضية فوراً
    }

    // 2. هنجيب تفاصيل الفعاليات دي من موديل الـ Event
    const events = await Event.find({
      _id: { $in: user.bookedEvents }, // ابحث عن كل الـ IDs اللي في مصفوفة اليوزر
    })
      .select("title date location image category") // هات الحقول دي بس
      .populate("organizer", "username") // هنا التعديل: بنروح لموديل الـ User وناخد حقل الـ username بس ✅
      .lean();

    // نبعت المصفوفة مباشرة زي ما إنت عايز يا سمسم
    res.json(events);
  } catch (error) {
    console.error("Error fetching booked events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//get booked event details to create ticket details page for user and organizer
router.get("/booked-event/:id", AuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    // 1. هنجيب اليوزر عشان نتاكد انه محجز الفعالية دي
    const user = await User.findById(userId).select("bookedEvents");
    if (!user || !user.bookedEvents.includes(eventId)) {
      return res
        .status(403)
        .json({ message: "Access denied. You haven't booked this event." });
    }
    // 2. هنجيب تفاصيل الفعالية دي من موديل الـ Event
    const event = await Event.findById(eventId)
      .select("title date location image category description price organizer") // هات الحقول دي بس
      // هنا التعديل: بنروح لموديل الـ User وناخد حقل الـ username بس ✅
      .populate("organizer", "username")
      .lean();
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }
    // نبعت تفاصيل الفعالية
    res.json(event);
  } catch (error) {
    console.error("Error fetching booked event details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// view members who booked an event by organizer or admin
router.get(
  "/event-bookings/:id",
  AuthMiddleware,
  authorize("organizer", "admin"),
  async (req, res) => {
    try {
      const eventId = req.params.id;
      const event = await Event.findById(eventId).populate(
        "attendees",
        "username email role",
      );
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event.attendees);
    } catch (error) {
      console.error("Error fetching event bookings:", error);
      res
        .status(500)
        .json({ message: "Server error while fetching event bookings" });
    }
  },
);

//delete attendee from one event by admin
router.delete(
  "/delete-attendee/:userId/:eventId",
  AuthMiddleware,
  authorize("admin"),
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const eventId = req.params.eventId;
      // Remove the user from the specific event's attendees list
      await Event.findByIdAndUpdate(eventId, {
        $pull: { attendees: userId },
        $inc: { availableSeats: 1 },
      });
      // Also remove the event from the user's bookedEvents list
      await User.findByIdAndUpdate(userId, {
        $pull: { bookedEvents: eventId },
      });

      res.json({ message: "Attendee removed from event successfully" });
    } catch (error) {
      console.error("Error removing attendee:", error);
      res.status(500).json({ message: "Server error while removing attendee" });
    }
  },
);

module.exports = router;
