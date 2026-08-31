import React, {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import API from "../api/axios";

import "./AdminDashboard.css";


export default function AdminDashboard() {

  const navigate = useNavigate();


  // ==================================================
  // DASHBOARD STATISTICS
  // ==================================================

  const [stats, setStats] = useState({
    students: 0,
    questions: 0,
    topics: 0,
    attempts: 0,
  });


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  // ==================================================
  // LOAD STATISTICS
  // ==================================================

  useEffect(() => {
    loadStats();
  }, []);


  const loadStats = async () => {

    try {

      setLoading(true);

      setError("");


      const response =
        await API.get("/admin/stats");


      console.log(
        "ADMIN STATS RESPONSE:",
        response.data
      );


      /*
      Backend response:

      {
        success: true,
        stats: {
          totalStudents: 1,
          totalTopics: 4,
          totalQuestions: 1,
          totalAttempts: 2
        }
      }
      */


      const statsData =
        response.data?.stats || {};


      setStats({

        students:
          Number(
            statsData.totalStudents || 0
          ),


        questions:
          Number(
            statsData.totalQuestions || 0
          ),


        topics:
          Number(
            statsData.totalTopics || 0
          ),


        attempts:
          Number(
            statsData.totalAttempts || 0
          ),

      });

    } catch (err) {

      console.error(
        "Failed to load admin statistics:",
        err
      );


      setError(
        err.response?.data?.message ||
        "Unable to load dashboard statistics."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==================================================
  // PAGE
  // ==================================================

  return (

    <div className="admin-dashboard-page">


      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <header className="admin-dashboard-header">

        <div className="admin-dashboard-title">

          <span className="admin-dashboard-label">
            ADMIN CONTROL CENTER
          </span>


          <h1>
            Admin Overview
          </h1>


          <p>
            Monitor your QuizNova platform
            from one place.
          </p>

        </div>


        <button
          type="button"
          className="admin-refresh-button"
          onClick={loadStats}
          disabled={loading}
        >

          <span className="refresh-icon">
            ↻
          </span>


          {loading
            ? "Loading..."
            : "Refresh Data"}

        </button>

      </header>


      {/* ==================================================
          ERROR MESSAGE
      ================================================== */}

      {error && (

        <div className="admin-error-box">

          <div className="admin-error-icon">
            !
          </div>


          <div className="admin-error-content">

            <strong>
              Dashboard data unavailable
            </strong>


            <p>
              {error}
            </p>

          </div>


          <button
            type="button"
            onClick={loadStats}
          >
            Retry
          </button>

        </div>

      )}


      {/* ==================================================
          STATISTICS SECTION
      ================================================== */}

      <section className="admin-statistics-section">


        <div className="admin-section-heading">

          <div>

            <span>
              PLATFORM OVERVIEW
            </span>


            <h2>
              Dashboard Statistics
            </h2>

          </div>


          <div className="live-data">

            <span className="live-dot"></span>

            Live data

          </div>

        </div>


        {/* ==================================================
            STATISTICS CARDS
        ================================================== */}

        <div className="admin-stats-grid">


          {/* ==================================================
              STUDENTS
          ================================================== */}

          <button
            type="button"
            className="admin-stat-card"
            onClick={() =>
              navigate("/admin/students")
            }
          >

            <div className="admin-stat-icon students">
              👥
            </div>


            <div className="admin-stat-content">

              <span className="admin-stat-label">
                Total Students
              </span>


              <strong>
                {loading
                  ? "—"
                  : stats.students}
              </strong>


              <small>
                Registered student accounts
              </small>

            </div>


            <span className="admin-stat-arrow">
              →
            </span>

          </button>


          {/* ==================================================
              QUESTIONS
          ================================================== */}

          <button
            type="button"
            className="admin-stat-card"
            onClick={() =>
              navigate("/admin/questions")
            }
          >

            <div className="admin-stat-icon questions">
              ?
            </div>


            <div className="admin-stat-content">

              <span className="admin-stat-label">
                Total Questions
              </span>


              <strong>
                {loading
                  ? "—"
                  : stats.questions}
              </strong>


              <small>
                Questions in question bank
              </small>

            </div>


            <span className="admin-stat-arrow">
              →
            </span>

          </button>


          {/* ==================================================
              TOPICS
          ================================================== */}

          <button
            type="button"
            className="admin-stat-card"
            onClick={() =>
              navigate("/admin/topics")
            }
          >

            <div className="admin-stat-icon topics">
              📚
            </div>


            <div className="admin-stat-content">

              <span className="admin-stat-label">
                Total Topics
              </span>


              <strong>
                {loading
                  ? "—"
                  : stats.topics}
              </strong>


              <small>
                Available quiz topics
              </small>

            </div>


            <span className="admin-stat-arrow">
              →
            </span>

          </button>


          {/* ==================================================
              QUIZ ATTEMPTS
          ================================================== */}

          <button
            type="button"
            className="admin-stat-card"
            onClick={() =>
              navigate("/admin/leaderboard")
            }
          >

            <div className="admin-stat-icon attempts">
              🏆
            </div>


            <div className="admin-stat-content">

              <span className="admin-stat-label">
                Quiz Attempts
              </span>


              <strong>
                {loading
                  ? "—"
                  : stats.attempts}
              </strong>


              <small>
                Total quiz attempts
              </small>

            </div>


            <span className="admin-stat-arrow">
              →
            </span>

          </button>


        </div>

      </section>


      {/* ==================================================
          SYSTEM STATUS
      ================================================== */}

      <section className="admin-system-card">


        <div className="system-icon">
          ✓
        </div>


        <div className="system-content">

          <span>
            SYSTEM STATUS
          </span>


          <h3>
            QuizNova is connected
          </h3>


          <p>
            Dashboard statistics are loaded
            directly from your MongoDB backend.
          </p>

        </div>


        <div className="system-status">

          <span className="status-dot"></span>

          Online

        </div>

      </section>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="admin-dashboard-footer">

        <span>
          © 2026 QuizNova. All rights reserved.
        </span>


        <span>
          Admin Console
        </span>

      </footer>


    </div>

  );

}