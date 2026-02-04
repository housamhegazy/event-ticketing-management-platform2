import React from "react";
import { useGetOrganizerEventsQuery, useDeleteEventMutation } from "../../Redux/events/createEventApi.js";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion"; // مكتبة الأنيميشن
import { useNavigate } from "react-router-dom";
const MyEvents = () => {
  const navigate = useNavigate()
  // if data is undefined, set events to an empty array
  const { data: events = [], isLoading, isError } = useGetOrganizerEventsQuery();
  const [deleteEvent] = useDeleteEventMutation();

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteEvent(id).unwrap();
        Swal.fire("Deleted!", "Event has been removed.", "success");
      } catch (err) {
        Swal.fire("Error!", err?.data?.message || "Delete failed.", "error");
      }
    }
  };

  if (isLoading) return <div className="text-center mt-5"><div className="spinner-border text-success"></div></div>;
  if (isError) return <div className="alert alert-danger m-5">Error loading events</div>;
  return (
    <div className="container mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h2 className="fw-bold text-dark">My Events Control Panel</h2>
        <Link to="/organizer/create-event" className="btn btn-success shadow-sm">
          Add New Event +
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center mt-5 py-5 border rounded bg-light">
          <p className="text-muted fs-4">You haven't created any events yet.</p>
        </div>
      ) : (
        
        <div className="row g-4">
          {events.map((event, index) => (
            <div key={event._id} className="col-12 col-md-6 col-lg-4">
              {/* إضافة أنيميشن عند ظهور الكروت */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }} // زوم بسيط عند تمرير الماوس
                className="card h-100 shadow-sm border-0 overflow-hidden"
              >
                {/* صورة الفعالية */}
                <div style={{ position: 'relative' }}>
                  <img 
                    onClick={() => navigate(`/organizer/events/${event._id}`)}
                    src={event.image || "https://via.placeholder.com/400x200?text=No+Image"} 
                    className="card-img-top" 
                    alt={event.title}
                    style={{ height: "200px", objectFit: "cover" ,cursor:"pointer"}}
                  />
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className={`badge ${event.isPublished ? 'bg-success' : 'bg-secondary'} shadow`}>
                      {event.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <h5 className="card-title fw-bold text-truncate">{event.title}</h5>
                  <p className="card-text text-muted small mb-2">
                    <i className="bi bi-calendar-event me-2"></i>
                    {new Date(event.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-success fw-bold">
                      {event.price === 0 ? "Free" : `${event.price} SAR`}
                    </span>
                    <span className="small text-muted">
                       {event.availableSeats} / {event.capacity} Seats
                    </span>
                  </div>
                  {/* organizer */}
                  <p className="card-text text-muted small">
                    <i className="bi bi-person-circle me-2"></i>
                    Organized by: {event.organizer?.username || "N/A"}
                  </p>
                  
                  {/* شريط تقدم للمقاعد المحجوزة (اختياري - شكل جمالي) */}
                  <div className="progress mb-3" style={{ height: "6px" }}>
                    <div 
                      className="progress-bar bg-info" 
                      role="progressbar" 
                      style={{ width: `${((event.capacity - event.availableSeats) / event.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="card-footer bg-white border-top-0 pb-3 d-flex gap-2">
                  <button onClick={()=>{navigate("/organizer/edit-event/" + event._id)}} className="btn btn-outline-primary flex-grow-1 btn-sm">Edit</button>
                  <button 
                    className="btn btn-outline-danger flex-grow-1 btn-sm"
                    onClick={() => handleDelete(event._id)}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;