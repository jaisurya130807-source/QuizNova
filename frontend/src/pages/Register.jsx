import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

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

  const validateForm = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword =
      formData.confirmPassword;

    if (!name) {
      return "Please enter your full name.";
    }

    if (name.length < 2) {
      return "Name must contain at least 2 characters.";
    }

    if (!email) {
      return "Please enter your email address.";
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return "Please enter a valid email address.";
    }

    if (!password) {
      return "Please create a password.";
    }

    if (password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (!confirmPassword) {
      return "Please confirm your password.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const response = await API.post(
        "/auth/register",
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: "student",
        }
      );

      setSuccess(
        response.data?.message ||
        "Account created successfully!"
      );

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      {/* BACKGROUND */}
      <div className="auth-orb auth-orb-one"></div>
      <div className="auth-orb auth-orb-two"></div>
      <div className="auth-orb auth-orb-three"></div>


      <div className="auth-container">


        {/* LEFT BRAND PANEL */}
        <section className="auth-brand-panel">

          <div className="auth-brand-content">

            <div className="auth-logo">

              <span className="auth-logo-icon">
                Q
              </span>

              <span className="auth-logo-text">
                Quiz<span>Nova</span>
              </span>

            </div>


            <span className="auth-eyebrow">
              START YOUR JOURNEY
            </span>


            <h1>
              Learn smarter.
              <span> Score higher.</span>
            </h1>


            <p>
              Create your QuizNova account
              and start testing your knowledge
              across different topics.
            </p>


            <div className="auth-features">

              <div className="auth-feature">

                <div className="feature-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Personalized learning
                  </strong>

                  <span>
                    Practice quizzes designed
                    to improve your knowledge.
                  </span>
                </div>

              </div>


              <div className="auth-feature">

                <div className="feature-icon">
                  ★
                </div>

                <div>
                  <strong>
                    Challenge yourself
                  </strong>

                  <span>
                    Test your skills and climb
                    the leaderboard.
                  </span>
                </div>

              </div>


              <div className="auth-feature">

                <div className="feature-icon">
                  ⚡
                </div>

                <div>
                  <strong>
                    Track your results
                  </strong>

                  <span>
                    Keep an eye on your scores
                    and quiz attempts.
                  </span>
                </div>

              </div>

            </div>

          </div>


          <div className="auth-brand-footer">
            © {new Date().getFullYear()} QuizNova
          </div>

        </section>


        {/* REGISTER PANEL */}
        <section className="auth-form-panel">

          <div className="auth-form-card register-card">


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
                STUDENT REGISTRATION
              </span>

              <h2>
                Create your account
              </h2>

              <p>
                Join QuizNova and start your
                learning journey.
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


              {/* NAME */}
              <div className="auth-field">

                <label htmlFor="register-name">
                  Full name
                </label>

                <div className="auth-input-wrapper">

                  <span className="input-icon">
                    ◯
                  </span>

                  <input
                    id="register-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    disabled={loading}
                  />

                </div>

              </div>


              {/* EMAIL */}
              <div className="auth-field">

                <label htmlFor="register-email">
                  Email address
                </label>

                <div className="auth-input-wrapper">

                  <span className="input-icon">
                    @
                  </span>

                  <input
                    id="register-email"
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

                <label htmlFor="register-password">
                  Password
                </label>

                <div className="auth-input-wrapper">

                  <span className="input-icon">
                    ●
                  </span>

                  <input
                    id="register-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
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

                <small className="field-hint">
                  Use at least 6 characters.
                </small>

              </div>


              {/* CONFIRM PASSWORD */}
              <div className="auth-field">

                <label htmlFor="confirm-password">
                  Confirm password
                </label>

                <div className="auth-input-wrapper">

                  <span className="input-icon">
                    ●
                  </span>

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={loading}
                  >
                    {showConfirmPassword
                      ? "◉"
                      : "◌"}
                  </button>

                </div>

              </div>


              {/* REGISTER BUTTON */}
              <button
                type="submit"
                className="auth-submit register-submit"
                disabled={loading}
              >

                {loading ? (

                  <>
                    <span className="button-spinner"></span>
                    Creating account...
                  </>

                ) : (

                  <>
                    Create account
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

              Already have an account?

              <Link to="/login">
                Sign in
              </Link>

            </p>

          </div>

        </section>

      </div>

    </main>
  );
}