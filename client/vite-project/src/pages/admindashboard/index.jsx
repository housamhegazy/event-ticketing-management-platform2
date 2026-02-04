import React, { useState } from "react";
import { useGetAllEventsQuery, useDeleteEventMutation,useGetEventAttendeesQuery,useDeleteAttendeeMutation } from "../../Redux/events/createEventApi";
import Swal from "sweetalert2";
import { Modal, Button, Table,Spinner } from "react-bootstrap"; // لو بتستخدم بوتستراب

const AdminDashboard = () => {
  const { data: events, isLoading, isError } = useGetAllEventsQuery();
  const [deleteEvent] = useDeleteEventMutation();
  
  // حالة للمودال (النافذة المنبثقة) لعرض المسجلين
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showModal, setShowModal] = useState(false);
const { data: attendeesData, isFetching: attendeesLoading } = useGetEventAttendeesQuery(
    selectedEventId, 
    { skip: !selectedEventId } 
  );
  const [deleteAttendee] = useDeleteAttendeeMutation();
  
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the event and all its bookings!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteEvent(id).unwrap();
        Swal.fire("Deleted!", "Event has been removed.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete event", "error");
      }
    }
  };

// 3. عند الضغط على الزرار بنحدث الـ ID بس
  const handleShowAttendees = (eventId) => {
    setSelectedEventId(eventId);
    setShowModal(true);
  };

  // تنظيف الـ ID عند قفل المودال عشان ميفضلش شايل بيانات قديمة
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEventId(null);
  };

  // حذف عضو من الحدث
  const handleDeleteAttendee = async (userId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will remove the member from the event!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, remove!",
    });
    if (result.isConfirmed) {
      try {
        await deleteAttendee({ eventId: selectedEventId, userId }).unwrap();
        Swal.fire("Removed!", "Member has been removed from the event.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to remove member", "error");
      }
    }
  };

  if (isLoading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4 fw-bold text-primary">Admin Dashboard - Manage Events</h2>
      
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th>Event Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Capacity</th>
                <th>Booked</th>
                <th>Remaining</th>
                <th>View Members</th>
                <th>organizer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events?.map((event) => (
                <tr key={event._id}>
                  <td className="fw-bold">{event.title}</td>
                  <td><span className="badge bg-info text-dark">{event.category}</span></td>
                  <td>{event.price === 0 ? "Free" : `${event.price} SAR`}</td>
                  <td>{event.capacity}</td>
                  <td>
                    <span className="text-success fw-bold">
                      {event.capacity - event.availableSeats}
                    </span>
                  </td>
                  <td>{event.availableSeats}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleShowAttendees(event._id)}
                    >
                      <i className="bi bi-people-fill"></i> View Members
                    </button>
                  </td>
                  <td>{event.organizer?.username || "N/A"}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(event._id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال عرض الأعضاء المسجلين */}
      {/* مودال عرض الأعضاء */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Registered Members</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {attendeesLoading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading members...</p>
            </div>
          ) : attendeesData?.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>delete</th>
                </tr>
              </thead>
              <tbody>
                {attendeesData.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td>{user.username || user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteAttendee(user._id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center text-muted p-4">No members registered yet.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;