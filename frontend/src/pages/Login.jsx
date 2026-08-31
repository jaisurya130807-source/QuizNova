import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/login", {
        email,
        password,
      });

      const data = response.data?.data || response.data;

      const token =
        data?.token ||
        response.data?.token;

      const user =
        data?.user ||
        response.data?.user;

      if (token) {
        localStorage.setItem("token", token);
      }

      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      }

      setSuccess("Login successful. Redirecting...");

      setTimeout(() => {
        if (user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }, 500);

    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      {/* Background decorations */}
      <div className="auth-orb auth-orb-one"></div>
      <div className="auth-orb auth-orb-two"></div>
      <div className="auth-orb auth-orb-three"></div>

      <div className="auth-container">

        {/* LEFT BRAND PANEL */}
        <section className="auth-brand-panel">

          <div className="auth-brand-content">

            <div className="auth-logo">
              <span className="auth-logo-icon">Q</span>

              <span className="auth-logo-text">
                Quiz<span>Nova</span>
              </span>
            </div>

            <span className="auth-eyebrow">
              LEARN • PRACTICE • EXCEL
            </span>

            <h1>
              Welcome back to
              <span> QuizNova.</span>
            </h1>

            <p>
              Continue your learning journey,
              challenge yourself, and track your
              quiz performance.
            </p>

            <div className="auth-features">

              <div className="auth-feature">
                <div className="feature-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Track your progress
                  </strong>

                  <span>
                    Monitor your quiz performance
                    and improvement.
                  </span>
                </div>
              </div>

              <div className="auth-feature">
                <div className="feature-icon">
                  ★
                </div>

                <div>
                  <strong>
                    Compete on the leaderboard
                  </strong>

                  <span>
                    See how you rank against
                    other students.
                  </span>
                </div>
              </div>

              <div className="auth-feature">
                <div className="feature-icon">
                  ⚡
                </div>

                <div>
                  <strong>
                    Learn at your pace
                  </strong>

                  <span>
                    Practice topics and improve
                    your knowledge.
                  </span>
                </div>
              </div>

            </div>

          </div>

          <div className="auth-brand-footer">
            © {new Date().getFullYear()} QuizNova
          </div>

        </section>


        {/* LOGIN PANEL */}
        <section className="auth-form-panel">

          <div className="auth-form-card">

            <div className="auth-mobile-logo">

              <div className="auth-logo">
                <span className="auth-logo-icon">
                  Q
                </span>

                <span className="auth-logo-text">
                  Quiz<span>Nova</span>
                </span>
              </div>

            </div>


            <div className="auth-heading">

              <span className="auth-card-kicker">
                STUDENT PORTAL
              </span>

              <h2>
                Welcome back
              </h2>

              <p>
                Login to continue your QuizNova
                journey.
              </p>

            </div>


            {error && (
              <div className="auth-message auth-error">
                <span className="message-icon">
                  !
                </span>

                <span>
                  {error}
                </span>
              </div>
            )}


            {success && (
              <div className="auth-message auth-success">
                <span className="message-icon">
                  ✓
                </span>

                <span>
                  {success}
                </span>
              </div>
            )}


            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              {/* EMAIL */}
              <div className="auth-field">

                <label htmlFor="login-email">
                  Email address
                </label>

                <div className="auth-input-wrapper">

                  <span className="input-icon">
                    @
                  </span>

                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={loading}
                  />

                </div>

              </div>


              {/* PASSWORD */}
              <div className="auth-field">

                <div className="password-label-row">

                  <label htmlFor="login-password">
                    Password
                  </label>

                </div>

                <div className="auth-input-wrapper">

                  <span className="input-icon">
                    ●
                  </span>

                  <input
                    id="login-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={loading}
                  >
                    {showPassword ? "◉" : "◌"}
                  </button>

                </div>

              </div>


              {/* SUBMIT */}
              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="button-arrow">
                      →
                    </span>
                  </>
                )}

              </button>

            </form>


            <div className="auth-divider">
              <span></span>
              <small>OR</small>
              <span></span>
            </div>


            <p className="auth-switch">

              Don't have an account?

              <Link to="/register">
                Create an account
              </Link>

            </p>

          </div>

        </section>

      </div>

    </main>
  );
}