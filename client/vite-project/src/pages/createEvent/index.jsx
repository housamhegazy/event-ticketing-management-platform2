import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateEventMutation } from "../../Redux/events/createEventApi.js"; // افترضت إنك عملت الـ API ده

const CreateEvent = () => {
  const [createEvent, { isLoading }] = useCreateEventMutation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other", // القيمة الافتراضية
    location: "",
    date: "",
    price: 0,
    capacity: 10,
    isPublished: true,
  });

  const [imgFile, setFile] = useState(null); // save image to send to db
  const [message, setMessage] = useState({ text: "", type: "" });
  // save event data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  //==================== sort image in state
  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    setFile(file);
  };
  // submit event data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 1. إنشاء كائن FormData حقيقي
    const data = new FormData();
    // 2. إضافة بقية بيانات الفعالية
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    // 3. إضافة ملف الصورة الفعلي (وليس الـ Base64)
    if (imgFile) {
      data.append("image", imgFile);
    }
    try {
      await createEvent(data).unwrap();
      setMessage({ text: "event created successfully!", type: "success" });
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage({
        text: err?.data?.message || "Failed to create event.",
        type: "error",
      });
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="card shadow-sm p-4 mx-auto" style={{ maxWidth: "700px" }}>
        <h2 className="text-center mb-4 text-success">Add Event</h2>

        <form onSubmit={handleSubmit}>
          {/* العنوان */}
          <div className="mb-3">
            <label className="form-label">Event Title</label>
            <input
              type="text"
              name="title"
              className="form-control"
              onChange={handleChange}
              required
            />
          </div>

          {/* الوصف */}
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="row">
            {/* التصنيف */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Category</label>
              <select
                name="category"
                className="form-select"
                onChange={handleChange}
                value={formData.category}
              >
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Education">Education</option>
                <option value="Technology">Technology</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* التاريخ */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Date and Time</label>
              <input
                type="datetime-local"
                name="date"
                className="form-control"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* المكان */}
          <div className="mb-3">
            <label className="form-label">Location (or Meeting Link)</label>
            <input
              type="text"
              name="location"
              className="form-control"
              onChange={handleChange}
              required
            />
          </div>

          <div className="row">
            {/* السعر */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Price (0 for free)</label>
              <input
                type="number"
                name="price"
                className="form-control"
                min="0"
                onChange={handleChange}
                required
              />
            </div>

            {/* السعة */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Maximum Attendance</label>
              <input
                type="number"
                name="capacity"
                className="form-control"
                min="1"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* صورة الفعالية */}
          <div className="mb-3">
            <label className="form-label">Event Image</label>
            <input
              type="file"
              name="image"
              className="form-control"
              onChange={handleImage}
            />
            {imgFile && (
              <div className="mt-3">
                <img
                  src={URL.createObjectURL(imgFile)}
                  alt="Preview"
                  className="img-thumbnail"
                  style={{ maxHeight: "200px" }}
                />
              </div>
            )}
          </div>
          {/* خيار النشر */}
          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              name="isPublished"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) =>
                setFormData({ ...formData, isPublished: e.target.checked })
              }
            />
            <label className="form-check-label" htmlFor="isPublished">
              Publish Event
            </label>
          </div>
          {/* زر الإرسال */}
          <button
            type="submit"
            className="btn btn-success w-100 py-2 fw-bold"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Event"}
          </button>
        </form>

        {message.text && (
          <div
            className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} mt-3`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEvent;
