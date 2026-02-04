import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetEventByIdQuery, useUpdateEventMutation } from "../../Redux/events/createEventApi.js";
import Swal from "sweetalert2";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 1. جلب بيانات الفعالية الحالية
  const { data: eventData, isLoading: isFetching } = useGetEventByIdQuery(id);
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
    price: 0,
    capacity: 10,
    isPublished: true,
  });

  const [imgFile, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  // 2. وضع البيانات القديمة في الـ State أول ما تحمل
  useEffect(() => {
    if (eventData) {
      setFormData({
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        location: eventData.location,
        // تحويل التاريخ لصيغة يفهمها الـ input
        date: eventData.date ? new Date(eventData.date).toISOString().slice(0, 16) : "",
        price: eventData.price,
        capacity: eventData.capacity,
        isPublished: eventData.isPublished,
      });
      setPreview(eventData.image);
    }
  }, [eventData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    if (imgFile) data.append("image", imgFile);

    try {
      await updateEvent({ id, data }).unwrap();
      Swal.fire("Success", "Event updated successfully!", "success");
      navigate("/organizer/events"); // أو أي مسار تحبه
    } catch (err) {
      Swal.fire("Error", err?.data?.message || "Failed to update", "error");
    }
  };

  if (isFetching) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container mt-5 mb-5">
      <div className="card shadow-sm p-4 mx-auto" style={{ maxWidth: "800px" }}>
        <h2 className="text-center mb-4 text-primary">Edit Event</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Title</label>
            <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Description</label>
            <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={handleChange} required />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Category</label>
              <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Education">Education</option>
                <option value="Technology">Technology</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Date & Time</label>
              <input type="datetime-local" name="date" className="form-control" value={formData.date} onChange={handleChange} required />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Location</label>
            <input type="text" name="location" className="form-control" value={formData.location} onChange={handleChange} required />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Price</label>
              <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Capacity</label>
              <input type="number" name="capacity" className="form-control" value={formData.capacity} onChange={handleChange} />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Change Image</label>
            <input type="file" className="form-control" onChange={handleImage} />
            {preview && <img src={preview} alt="Preview" className="img-thumbnail mt-2" style={{ maxHeight: "150px" }} />}
          </div>
          {/* publish event */}
          <div className="form-check mb-4">
            <input 
              className="form-check-input" 
              type="checkbox" 
              name="isPublished" 
              checked={formData.isPublished} 
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} 
            />
            <label className="form-check-label fw-bold">
              Publish Event
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={isUpdating}>
            {isUpdating ? "Saving Changes..." : "Update Event"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;