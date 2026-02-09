import React from "react";
import { useSelector } from "react-redux";
import { Link, NavLink } from "react-router";
import { useNavigate } from "react-router-dom";
import { useSignOutMutation } from "../Redux/user/userApi";
const Navebar = () => {
  // @ts-ignore
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [signOut] = useSignOutMutation();
  const handleSignOut = async (e) => {
    e.preventDefault();
    try {
      await signOut().unwrap();
      // dispatch(clearAuthUser());
      navigate("/signin");
    } catch (error) {
      console.error("Sign out failed:", error);
      alert("Sign out failed. Please try again.");
    }
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-light shadow bg-dark">
      <div className="container">
        {/* dashboard logo only for admin  */}
        {user?.role === "admin" && (
          <NavLink className="navbar-brand fw-bold me-3" to="/admin/dashboard">
            🛠️ Admin Dashboard
          </NavLink>
        )}
        {/* الشعار */}
        {/* for user and organizer */}
        <NavLink to={"/"}>
          <img
            src="/logo.png"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              marginRight: "10",
            }}
          ></img>
        </NavLink>
        {(user?.role === "user" || user?.role === "organizer") && (
          <NavLink className="navbar-brand fw-bold me-3" to="/my-booked-events">
            Events Tickets
          </NavLink>
        )}

        {/* زرار القائمة للموبايل */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {/* روابط التنقل */}
            {/* admin : for all users page  */}

            {isAuthenticated && user?.role === "admin" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/all-users">
                  All Users
                </NavLink>
              </li>
            )}

            {/* main page only on registered user and organizer */}

            <li className="nav-item">
              <NavLink className="nav-link " to="/">
                Main Page
              </NavLink>
            </li>

            {isAuthenticated && user?.role === "organizer" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/organizer/create-event">
                  Create Event
                </NavLink>
              </li>
            )}
            {isAuthenticated && user?.role === "admin" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin/dashboard">
                  Manage Events
                </NavLink>
              </li>
            )}
            {isAuthenticated && user?.role === "organizer" && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/organizer/events">
                  My Events
                </NavLink>
              </li>
            )}
            {/* زرار تسجيل الدخول */}
            {isAuthenticated ? (
              <li className="nav-item ms-lg-3">
                <Link
                  className="btn btn-outline-light rounded-pill px-4"
                  to="/profile"
                >
                  {user?.username || "Profile"}
                </Link>
              </li>
            ) : (
              <li className="nav-item ms-lg-3">
                <NavLink
                  className="btn btn-primary rounded-pill px-4"
                  to="/signin"
                >
                  Sign In
                </NavLink>
              </li>
            )}
            {!isAuthenticated && (
              <li className="nav-item ms-lg-2">
                <NavLink
                  className="btn btn-outline-light rounded-pill px-4"
                  to="/signup"
                >
                  Sign Up
                </NavLink>
              </li>
            )}
            {isAuthenticated && (
              <li className="nav-item ms-lg-2">
                <NavLink
                  onClick={handleSignOut}
                  className="btn btn-danger rounded-pill px-4"
                  to="/signin"
                >
                  Sign Out
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navebar;
