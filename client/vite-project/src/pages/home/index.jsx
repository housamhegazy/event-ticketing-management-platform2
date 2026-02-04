import React, { useState } from "react";
import { useGetAllEventsQuery } from "../../Redux/events/createEventApi.js";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SearchBar from "./eventsSearch.jsx"; // استيراد الكومبوننت الجديد

const Home = () => {
  const { data: events, isLoading, isError } = useGetAllEventsQuery();
  const [searchTerm, setSearchTerm] = useState("");

  // تصفية الفعاليات بناءً على البحث
  const filteredEvents = events?.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="text-center mt-5 py-5"><div className="spinner-grow text-success"></div></div>;
  if (isError) return <div className="alert alert-danger m-5 text-center">Failed to load events. Please try again later.</div>;

  return (
    <div className="container mb-5">
      {/* قسم الترحيب والبحث */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* عرض الكروت */}
      <div className="row g-4">
        {filteredEvents?.length > 0 ? (
          filteredEvents.map((event, index) => (
            <motion.div 
              key={event._id}
              className="col-12 col-md-6 col-lg-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden position-relative hover-shadow">
                {/* صورة الفعالية */}
                <img 
                  src={event.image || "https://via.placeholder.com/400x250"} 
                  className="card-img-top" 
                  alt={event.title}
                  style={{ height: "220px", objectFit: "cover" }}
                />
                
                {/* السعر فوق الصورة */}
                <div className="position-absolute top-0 start-0 m-3">
                  <span className="badge bg-dark px-3 py-2 shadow">
                    {event.price === 0 ? "FREE" : `${event.price} SAR`}
                  </span>
                </div>

                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-success fw-bold text-uppercase">{event.category}</small>
                    <small className="text-muted">
                      <i className="bi bi-people me-1"></i>
                      {event.availableSeats} Left
                    </small>
                  </div>
                  
                  <h5 className="card-title fw-bold text-dark">{event.title}</h5>
                  <p className="card-text text-muted small mb-3">
                    <i className="bi bi-geo-alt me-1 text-danger"></i> {event.location}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <div className="small">
                      <i className="bi bi-calendar3 me-1"></i>
                      {new Date(event.date).toLocaleDateString('en-GB')}
                    </div>
                    {/* organizer  */}
                    <p className="text-muted small mb-0">
                      <i className="bi bi-person-circle me-1"></i>
                      {event.organizer?.username || "N/A"}
                    </p>
                    <Link to={`/organizer/events/${event._id}`} className="btn btn-outline-success btn-sm px-4 rounded-pill fw-bold">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-5">
            <h3 className="text-muted">No events found matching your search.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;