import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSigninMutation } from "../../Redux/user/userApi";

const SigninForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signin, { isLoading }] = useSigninMutation();
  const [message, setMessage] = useState({ text: "", type: "" });

  const validate = () => {
    if (!email || !password) {
      setMessage({ text: "Please fill in all fields.", type: "error" });
      return false;
    }
    if (password.length < 6) {
      setMessage({
        text: "Password must be at least 6 characters long.",
        type: "error",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    if (!validate()) return;
    try {
      // استخدام unwrap لضمان الدخول في بلوك الـ catch عند الفشل
      await signin({ email, password }).unwrap();
      
      setMessage({ text: "Signin successful! Redirecting...", type: "success" });
      // التوجيه فقط في حالة النجاح التام
      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      console.error("Login Error Details:", err); // عشان تشوف الخطأ في الـ console
      
      // التأكد من عرض الرسالة القادمة من السيرفر
      setMessage({
        text: err?.data?.message || err?.error || "Signin failed. Please try again.",
        type: "error",
      });
      
      // مهم جداً: تأكد إن مفيش أي Navigate بيحصل هنا
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* الكارت الزجاجي (نفس كلاس السين أب) */}
      <div
        className="signup-card-glass shadow-lg p-4 mx-3"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <div className="card-body">
          <h2 className="text-center mb-4 fw-bold text-white">
            {" "}
            Welcome Back{" "}
          </h2>
          <p className="text-center text-white-50 mb-4 small">
            Enter your details to access your account
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="mb-3">
              <label className="form-label text-white-50 small">
                Email Address
              </label>
              <input
                type="email"
                className="form-control glass-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="form-label text-white-50 small">Password</label>
              <input
                type="password"
                className="form-control glass-input"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="btn btn-primary-gradient w-100 fw-bold py-2 mt-2 shadow-sm border-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm" />
              ) : (
                "SIGN IN"
              )}
            </button>
          </form>

          {/* Alert Message */}
          {message.text && (
            <div
              className={`mt-3 alert py-2 small ${message.type === "success" ? "alert-success" : "alert-danger"}`}
              role="alert"
            >
              {message.text}
            </div>
          )}

          <div className="text-center mt-4">
            <p className="text-white-50 small">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-info fw-bold text-decoration-none ms-1"
              >
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigninForm;
