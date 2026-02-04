import React, { useState, useEffect} from "react";
import { useSelector } from "react-redux";
import { useEditProfileMutation  } from "../../Redux/user/userApi";
import { clearAuthUser } from "../../Redux/user/authSlice"; // تأكد من المسار حسب مشروعك
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { Form, Button, Container, Card, Row, Col, Image, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router";

const EditProfile = () => {
  // @ts-ignore
  const { user } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading }] = useEditProfileMutation();
  
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    avatar: null,
    role: "",
  });
  const [preview, setPreview] = useState("");

  // ملء البيانات الحالية عند تحميل الصفحة
  useEffect(() => {
    if (user) {
      // @ts-ignore
      setFormData({ username: user.username, email: user.email, role: user.role });
      setPreview(user.avatar);
    }
  }, [user]);

  const handleChange = (e) => {
    if (e.target.name === "avatar") {
      const file = e.target.files[0];
      setFormData({ ...formData, avatar: file });
      setPreview(URL.createObjectURL(file)); // عرض صورة مؤقتة
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("role", formData.role);
    if (formData.avatar) {
      data.append("file", formData.avatar);
    }

    try {
    const response =   await updateProfile(data).unwrap();
      if (response.requiresLogout) {
      // 1. مسح بيانات اليوزر من الـ Redux State (لو عندك Logout Action)
      dispatch(clearAuthUser()); 
      
      // 2. إظهار تنبيه لليوزر
      Swal.fire("Success", "profile updated successfully , please login", "success");
      
      // 3. التوجيه لصفحة اللوجن
      navigate("/login");
    } else {
      Swal.fire("Success", "Profile updated successfully!", "success");
    }
      
    } catch (err) {
      Swal.fire("Error", err.data?.message || "Failed to update profile", "error");
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow border-0 rounded-4">
            <Card.Body className="p-4">
              <h3 className="fw-bold text-center mb-4">Edit Profile</h3>
              
              <div className="text-center mb-4 position-relative">
                <Image
                  src={preview || "https://via.placeholder.com/150"}
                  roundedCircle
                  style={{ width: "120px", height: "120px", objectFit: "cover" }}
                  className="border shadow-sm"
                />
                <Form.Label htmlFor="avatar-upload" className="d-block mt-2 text-primary border-bottom d-inline-block" style={{cursor: 'pointer'}}>
                   Change Avatar
                </Form.Label>
                <Form.Control
                  id="avatar-upload"
                  type="file"
                  className="d-none"
                  accept="image/*"
                  name="avatar"
                  onChange={handleChange}
                />
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* edit role */}
{(user?.role === "user" || user?.role === "organizer") && (
  <Form.Group className="mb-3">
    <Form.Label className="fw-bold">Role</Form.Label>
    <Form.Select
      name="role"
      value={formData.role}
      onChange={handleChange}
      required
      // إضافة ستايل بسيط لو اتغير
      className={formData.role !== user.role ? "border-warning" : ""}
    >
      <option value="user">User</option>
      <option value="organizer">Organizer</option>
    </Form.Select>
    
    {/* التنبيه يظهر فقط لو القيمة مختلفة عن اللي في الداتابيز */}
    {formData.role !== user.role && (
      <Form.Text className="text-warning d-block mt-2 fw-medium">
        <i className="bi bi-exclamation-triangle-fill me-1"></i>
        Note: Changing your role to <strong>{formData.role}</strong> will require you to sign out and sign in again to update your permissions.
      </Form.Text>
    )}
  </Form.Group>
)}

                <div className="d-grid gap-2 mt-4">
                  <Button variant="primary" type="submit" disabled={isLoading} className="rounded-3 py-2">
                    {isLoading ? <Spinner size="sm" /> : "Save Changes"}
                  </Button>
                  <Button variant="outline-secondary" className="rounded-3" onClick={() => window.history.back()}>
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditProfile;