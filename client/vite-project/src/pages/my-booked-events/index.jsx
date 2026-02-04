import React from "react";
import { useGetBookedEventsQuery } from "../../Redux/events/createEventApi.js";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
const MyBookedEvents = () => {
  const { data: bookedEvents, isLoading, isError } = useGetBookedEventsQuery();
  const navigate = useNavigate();

  if (isLoading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-success"></div>
      </div>
    );
  if (isError)
    return (
      <div className="alert alert-danger m-5">
        Failed to load your bookings.
      </div>
    );

  return (
    <div className="container mt-5 mb-5">
      <h2 className="fw-bold mb-4 border-start border-success border-4 ps-3">
        My Booked Events
      </h2>

      {bookedEvents?.length > 0 ? (
        <div className="row g-4">
          {bookedEvents.map((event) => (
            <motion.div
              key={event._id}
              className="col-md-6 col-lg-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                <img
                  src={event.image}
                  onClick={()=>{navigate(`/organizer/events/${event._id}`)}}
                  className="card-img-top"
                  alt={event.title}
                  style={{ height: "180px", objectFit: "cover",cursor:"pointer" }}
                />
                <div className="card-body">
                  <span className="badge bg-light text-success mb-2">
                    {event.category}
                  </span>
                  <h5 className="card-title fw-bold text-dark">
                    {event.title}
                  </h5>
                  <p className="card-text text-muted small">
                    <i className="bi bi-calendar-event me-2"></i>
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="card-text text-muted small">
                    <i className="bi bi-geo-alt me-2 text-danger"></i>
                    {event.location}
                  </p>
                  {/* organizer */}
                  <p className="card-text text-muted small">
                    <i className="bi bi-person-circle me-2"></i>
                    Organized by: {event.organizer?.username || "N/A"}
                  </p>
                  <Link
                    to={`/ticket/${event._id}`}
                    className="btn btn-success w-100 rounded-pill mt-2"
                  >
                    Get My Ticket
                  </Link>

                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 bg-light rounded-4">
          <i className="bi bi-ticket-perforated fs-1 text-muted"></i>
          <h4 className="mt-3 text-muted">
            You haven't booked any events yet.
          </h4>
          <Link to="/" className="btn btn-success mt-3 px-4 rounded-pill">
            Explore Events
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyBookedEvents;
