import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import "./Auth.css";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { post } = useApi();

  const handleLogInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await post("/api/auth/login", { username, password });
      localStorage.setItem("adminToken", response.token);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await post("/api/auth/register", { username, password });
      localStorage.setItem("adminToken", response.token);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header-text">
        <h2>Quiz Platform</h2>
      </div>

      <div className="auth-wrapper">
        {/* Slanted Dark Hero Section */}
        <div className="auth-hero">
          <div className="auth-hero-content">
            <span className="hero-subtitle">Real-Time Quiz Platform</span>
            <h1 className="hero-title">
              Level up your daily
              <br />
              learning quest
            </h1>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="auth-card-container">
          {/* Floating Toggle */}
          <div className="auth-toggle">
            <button
              className={`toggle-btn ${isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`toggle-btn ${!isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <div className="auth-card">
            <form
              className="auth-form"
              onSubmit={(e) => {
                if (isLogin) {
                  handleLogInSubmit(e);
                } else {
                  handleRegisterSubmit(e);
                }
              }}
            >
              {!isLogin && (
                <div className="form-group">
                  <label>FULL NAME</label>
                  <div className="input-wrapper">
                    <svg
                      className="input-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Curator Name"
                      className="auth-input"
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>EMAIL ADDRESS</label>
                <div className="input-wrapper">
                  <svg
                    className="input-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                  </svg>
                  <input
                    type="email"
                    placeholder="curator@kinetic.com"
                    className="auth-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="password-header">
                  <label>PASSWORD</label>
                  {isLogin && (
                    <a href="#" className="forgot-link">
                      FORGOT?
                    </a>
                  )}
                </div>
                <div className="input-wrapper">
                  <svg
                    className="input-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-btn">
                <span>
                  {isLogin ? "Continue to Discovery" : "Start Your Journey"}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        <p className="auth-footer">
          By continuing, you are choosing to embark on a journey of discovery
          and agree to our <a href="#">Terms of Service</a> and{" "}
          <a href="#">Privacy Protocol</a>.
        </p>
      </div>
    </div>
  );
}

export default Auth;
