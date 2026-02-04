import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Root from "./Root";
import Home from "./pages/home";
import ErrorPage from "./pages/ErrorPage";
import SignUpForm from "./pages/signup";
import SigninForm from "./pages/signin";
import { useSelector } from "react-redux";
import Profile from "./pages/profile";
import MyEvents from "./pages/myEvents";
import CreateEvent from "./pages/createEvent";
import EventDetails from "./pages/myEvents/eventDetails";
import EditEvent from "./pages/editEvent";
import MyBookedEvents from "./pages/my-booked-events";
import Ticket from "./pages/printTicket";
import AdminDashboard from "./pages/admindashboard";
import UsersManager from "./pages/admindashboard/allUsers";
import EditProfile from "./pages/profile/editProfile";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoadingAuth, user } = useSelector(
    (state) => state.auth,
  );

  if (isLoadingAuth)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border"></div>
      </div>
    );

  if (!isAuthenticated) return <Navigate to="/signin" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />; // لو داخل مكان مش من حقه يرجع للرئيسية
  }

  return children;
};

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <ErrorPage />,
      children: [
        // home route for authenticated users(user and organizer)
        {
          index: true,
          element: isAuthenticated ? (
            user?.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Home />
            )
          ) : (
            <Navigate to="/signin" />
          ),
        },
        
        // auth routes
        {
          path: "/signup",
          element: !isAuthenticated ? <SignUpForm /> : <Navigate to="/" />,
        },
        {
          path: "/signin",
          element: !isAuthenticated ? <SigninForm /> : <Navigate to="/" />,
        },
        // --- Authenticated User Routes (User & Organizer & Admin) ---
        // profile route
        {
          path: "/profile",
          element: <ProtectedRoute allowedRoles={["user", "organizer", "admin"]}>
            <Profile />
          </ProtectedRoute>,
        },
        // edit profile route
        {
          path: "/profile/edit",
          element: <ProtectedRoute allowedRoles={["user", "organizer"]}>
            <EditProfile />
          </ProtectedRoute>,
        },
        // organizer route => my events
        {
          path: "/organizer/events",
          element:
            <ProtectedRoute allowedRoles={["organizer"]}>
              <MyEvents />
            </ProtectedRoute>,
        },
        // organizer and user route => event details
        {
          path: "/organizer/events/:id",
          element: <ProtectedRoute allowedRoles={["user", "organizer"]}>
            <EventDetails />
          </ProtectedRoute>,
        },
        // organizer route => create event
        {
          path: "/organizer/create-event",
          element:
            <ProtectedRoute allowedRoles={["organizer"]}>
              <CreateEvent />
            </ProtectedRoute>,
        },
        // organizer route => edit event
        {
          path: "/organizer/edit-event/:id",
          element:
            <ProtectedRoute allowedRoles={["organizer"]}>
              <EditEvent />
            </ProtectedRoute>,
        },
        // organizer and user route => my booked events
        {
          path: "/my-booked-events",
          element: <ProtectedRoute allowedRoles={["user", "organizer"]}>
            <MyBookedEvents />
          </ProtectedRoute>,
        },
        // organizer and user route => ticket
        {
          path: "/ticket/:id",
          element: <ProtectedRoute allowedRoles={["user", "organizer"]}>
            <Ticket />
          </ProtectedRoute>,
        },
        // only for admin
        {
          path: "/admin/dashboard",
          element:
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>,
        },
        // only for admin
        {
          path: "/admin/all-users",
          element:
            <ProtectedRoute allowedRoles={["admin"]}>
              <UsersManager />
            </ProtectedRoute>,
        },
        {
          path: "*",
          element: <ErrorPage />,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
