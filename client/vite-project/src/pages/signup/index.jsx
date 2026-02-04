import React from "react";
import { useState } from "react";
import { useSignupMutation } from "../../Redux/user/userApi";
import { useNavigate } from "react-router-dom";
import "./signup.css"
const SignUpForm = () => {
  const [signup, { isLoading }] = useSignupMutation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  // حالات التحقق من الأخطاء
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  // وظيفة لتحديث بيانات النموذج
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // مسح الخطأ بمجرد أن يبدأ المستخدم في الكتابة
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    // مسح رسالة النجاح/الفشل عند التعديل
    if (message.text) {
      setMessage({ text: "", type: "" });
    }
  };

  // وظيفة التحقق من صحة الحقول
  const validate = () => {
    let tempErrors = {};
    let isValid = true;
    // تحقق من أن اسم المستخدم ليس فارغًا
    if (!formData.username.trim()) {
      tempErrors.username = "Username is required.";
      isValid = false;
    } else if (/\s/.test(formData.username)) {
      // تحقق من وجود مسافات
      tempErrors.username = "Username cannot contain spaces.";
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      tempErrors.username =
        "Username should be alphanumeric and between 3-20 characters.";
      isValid = false;
    }

    if (!formData.email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
      tempErrors.email = "Invalid email address.";
      isValid = false;
    }
    if (formData.password.length < 6) {
      tempErrors.password = "password must be at least 6 characters long.";
      isValid = false;
    }
    setErrors(tempErrors);
    return isValid;
  };
  // signup form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setMessage({
        text: "Please enter valid credentials to sign in.",
        type: "error",
      });
      return;
    }
    try {
      await signup(formData).unwrap();
      setMessage({ text: "Success", type: "success" });

      setTimeout(() => {
        navigate("/");
      }, 1500); // تأخير بسيط قبل إعادة التوجيه
    } catch (err) {
      console.log("Signup Error:", err);
      setMessage({
        text: err?.data?.message || "Registration failed",
        type: "error",
      });
    }
  };
// ... باقي الـ imports ...

return (
  <div
    className="d-flex justify-content-center align-items-center vh-100"
    style={{
      backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/background.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
  >
    {/* الكارت بتصميم الزجاج الشفاف */}
    <div className="signup-card-glass shadow-lg p-4 mx-3">
      <div className="card-body">
        <h2 className="text-center mb-4 fw-bold text-white">
          Join the Experience
        </h2>
        <p className="text-center text-white-50 mb-4">Create your account to start booking</p>
        
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-3 custom-input-group">
            <label className="form-label text-white-50 small">Username</label>
            <input
              type="text"
              name="username"
              className="form-control glass-input"
              placeholder="Unique username"
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-3 custom-input-group">
            <label className="form-label text-white-50 small">Email Address</label>
            <input
              type="email"
              name="email"
              className={`form-control glass-input ${errors.email ? "is-invalid" : ""}`}
              placeholder="name@example.com"
              onChange={handleChange}
              required
            />
            {errors.email && <div className="invalid-feedback text-warning">{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="mb-4 custom-input-group">
            <label className="form-label text-white-50 small">Password</label>
            <input
              type="password"
              name="password"
              className="form-control glass-input"
              placeholder="Min. 6 characters"
              onChange={handleChange}
              required
            />
          </div>

          {/* Role Selection */}
          <div className="d-flex gap-4 mb-4 justify-content-center text-white">
            <label className="role-option">
              <input
                type="radio"
                value="user"
                name="role"
                checked={formData.role === "user"}
                onChange={handleChange}
              />
              <span className="ms-2">Attendee</span>
            </label>
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="organizer"
                checked={formData.role === "organizer"}
                onChange={handleChange}
              />
              <span className="ms-2">Organizer</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary-gradient w-100 fw-bold py-2 shadow-sm border-0">
            {isLoading ? <span className="spinner-border spinner-border-sm" /> : "GET STARTED"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-white-50 small">
            Already have an account? <a href="/signin" className="text-info fw-bold text-decoration-none ms-1">Sign In</a>
          </p>
        </div>

        {message.text && (
          <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} mt-3 py-2 small`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default SignUpForm;
