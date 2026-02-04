import React from "react";
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../../Redux/user/userApi";
import Swal from "sweetalert2";
import { Table, Button, Badge, Spinner } from "react-bootstrap";

const UsersManager = () => {
  const { data: users, isLoading, isError } = useGetAllUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This user account will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(id).unwrap();
        Swal.fire("Deleted!", "User has been removed.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete user", "error");
      }
    }
  };

  const handleChangeRole = async (id, currentRole) => {
    const roles = ["user", "organizer"];
    const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length];
    
    try {
      await updateUser({ id, role: nextRole }).unwrap();
      Swal.fire("Updated!", `User role changed to ${nextRole}.`, "success");
    } catch (err) {
      Swal.fire("Error", "Failed to update role", "error");
    }
  };

  if (isLoading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading Users...</p>
      </div>
    );

  if (isError)
    return <div className="text-center mt-5 text-danger">Error loading users data.</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">User Management</h2>
        <Badge bg="secondary">{users?.length} Total Users</Badge>
      </div>

      <div className="card shadow border-0 rounded-4 overflow-hidden">
        <Table hover responsive className="mb-0">
          <thead className="bg-light">
            <tr>
              <th>Username</th>
              <th>Email Address</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u._id}>
                <td className="fw-bold">{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <Badge
                    bg={
                      u.role === "admin"
                        ? "danger"
                        : u.role === "organizer"
                          ? "success"
                          : "primary"
                    }
                  >
                    {u.role.toUpperCase()}
                  </Badge>
                </td>
                <td>
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </td>
                <td>
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleChangeRole(u._id, u.role)}
                  >
                    Change Role
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(u._id)}
                  >
                    <i className="bi bi-trash"></i> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default UsersManager;