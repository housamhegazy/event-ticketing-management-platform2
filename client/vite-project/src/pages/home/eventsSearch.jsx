import React from "react";
import "./searchbar.css";

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search-hero-section mb-5">
      {/* طبقات الأنيميشن في الخلفية */}
      <div className="animated-bg">
        <div className="cube"></div>
        <div className="cube"></div>
        <div className="cube"></div>
        <div className="cube"></div>
        <div className="cube"></div>
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 text-center text-white mb-4">
            <h2 className="fw-bold">Explore Amazing Events</h2>
            <p className="opacity-75">Don't miss out on your next favorite experience</p>
          </div>
          <div className="col-md-6">
            <div className="input-group shadow-lg rounded-pill overflow-hidden border-0 custom-search-bar">
              <span className="input-group-text bg-white border-0 ps-4">
                <i className="bi bi-search text-primary"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 py-3"
                placeholder="Search by event title or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ boxShadow: 'none' }}
              />
              {searchTerm && (
                <button 
                  className="btn bg-white border-0 pe-4" 
                  onClick={() => setSearchTerm("")}
                >
                  <i className="bi bi-x-lg text-muted"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;