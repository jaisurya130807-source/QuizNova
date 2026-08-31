import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import API from "../api/axios";

import "./Dashboard.css";
import "./DashboardAdminReturn.css";

/*
====================================================
DEFAULT ICONS
====================================================
*/

const topicIcons = [
  "☕",
  "🐍",
  "C",
  "▣",
  "∑",
  "⚛",
  "🌐",
  "💻",
  "📚",
  "🧠",
];

const topicTones = [
  "violet",
  "blue",
  "cyan",
  "green",
  "orange",
];

/*
====================================================
DASHBOARD
====================================================
*/

export default function Dashboard() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  /*
  ==================================================
  ADMIN STUDENT VIEW
  ==================================================
  */

  const adminViewFromUrl =
    searchParams.get("adminView") ===
    "true";

  const adminViewFromSession =
    sessionStorage.getItem(
      "quiznovaAdminStudentView"
    ) === "true";

  const isAdminStudentView =
    adminViewFromUrl ||
    adminViewFromSession;

  /*
  ==================================================
  USER
  ==================================================
  */

  const user = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") ||
          "{}"
      );
    } catch {
      return {};
    }
  }, []);

  /*
  ==================================================
  TOPICS
  ==================================================
  */

  const [categories, setCategories] =
    useState([]);

  const [selected, setSelected] =
    useState("");

  const [loadingTopics, setLoadingTopics] =
    useState(true);

  const [topicError, setTopicError] =
    useState("");

  /*
  ==================================================
  LOAD TOPICS FROM MONGODB
  ==================================================
  */

  const loadTopics = async () => {
    try {
      setLoadingTopics(true);
      setTopicError("");

      const response =
        await API.get("/topics");

      const data = response.data;

      const topics =
        Array.isArray(data)
          ? data
          : data.topics || [];

      const formattedTopics =
        topics.map(
          (topic, index) => ({
            _id:
              topic._id ||
              topic.id,

            name: topic.name,

            description:
              topic.description ||
              "Practice and improve your skills.",

            count:
              Number(
                topic.questionCount
              ) || 0,

            durationSeconds:
              Number(
                topic.durationSeconds
              ) || 30,

            icon:
              topicIcons[
                index %
                  topicIcons.length
              ],

            tone:
              topicTones[
                index %
                  topicTones.length
              ],
          })
        );

      setCategories(
        formattedTopics
      );

      /*
      If the previously selected topic
      was deleted by admin, clear it.
      */

      setSelected((previous) => {
        const stillExists =
          formattedTopics.some(
            (topic) =>
              topic.name ===
              previous
          );

        return stillExists
          ? previous
          : "";
      });
    } catch (error) {
      console.error(
        "Failed to load topics:",
        error
      );

      setTopicError(
        error.response?.data?.message ||
          "Unable to load topics from MongoDB."
      );

      setCategories([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  /*
  ==================================================
  LOAD WHEN DASHBOARD OPENS
  ==================================================
  */

  useEffect(() => {
    loadTopics();
  }, []);

  /*
  ==================================================
  START QUIZ
  ==================================================
  */

  const startQuiz = () => {
    if (!selected) {
      return;
    }

    const selectedTopic =
      categories.find(
        (topic) =>
          topic.name === selected
      );

    /*
    Save selected topic.
    */

    localStorage.setItem(
      "category",
      selected
    );

    /*
    Save timer as backup.
    The Quiz page will also get
    the timer from MongoDB.
    */

    if (selectedTopic) {
      localStorage.setItem(
        "quizDurationSeconds",
        String(
          selectedTopic.durationSeconds
        )
      );
    }

    navigate(
      `/quiz?subject=${encodeURIComponent(
        selected
      )}`
    );
  };

  /*
  ==================================================
  RETURN TO ADMIN
  ==================================================
  */

  const returnToAdmin = () => {
    sessionStorage.removeItem(
      "quiznovaAdminStudentView"
    );

    navigate("/admin", {
      replace: true,
    });
  };

  /*
  ==================================================
  LOGOUT
  ==================================================
  */

  const logout = () => {
    sessionStorage.removeItem(
      "quiznovaAdminStudentView"
    );

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    localStorage.removeItem(
      "category"
    );
    localStorage.removeItem(
      "quizDurationSeconds"
    );

    navigate("/login", {
      replace: true,
    });
  };

  /*
  ==================================================
  TOTAL QUESTIONS
  ==================================================
  */

  const totalQuestions =
    categories.reduce(
      (total, topic) =>
        total + topic.count,
      0
    );

  /*
  ==================================================
  RENDER
  ==================================================
  */

  return (
    <div className="dash-page">

      {/* ==========================================
          ADMIN STUDENT VIEW
      =========================================== */}

      {isAdminStudentView && (
        <div className="admin-student-view-bar">
          <div className="admin-student-view-content">

            <div className="admin-student-view-info">

              <div className="admin-view-shield">
                🛡️
              </div>

              <div className="admin-view-text">

                <strong>
                  Admin Student View
                </strong>

                <span>
                  You are viewing QuizNova
                  as a student
                </span>

              </div>

            </div>

            <button
              type="button"
              className="return-admin-button"
              onClick={returnToAdmin}
            >
              <span className="return-admin-arrow">
                ←
              </span>

              <span>
                Return to Admin Overview
              </span>
            </button>

          </div>
        </div>
      )}

      {/* ==========================================
          NAVIGATION
      =========================================== */}

      <header className="dash-nav">

        {/* BRAND */}

        <div className="dash-brand">

          <div className="brand-mark">
            Q
          </div>

          <div>
            <b>
              QuizNova
            </b>

            <small>
              Learn • Practice • Compete
            </small>
          </div>

        </div>

        {/* NAVIGATION */}

        <nav>

          <button
            type="button"
            onClick={() => {
              if (
                isAdminStudentView
              ) {
                navigate(
                  "/dashboard?adminView=true"
                );
              } else {
                navigate(
                  "/dashboard"
                );
              }
            }}
            className="active"
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => {
              if (
                isAdminStudentView
              ) {
                navigate(
                  "/leaderboard?adminView=true"
                );
              } else {
                navigate(
                  "/leaderboard"
                );
              }
            }}
          >
            Leaderboard
          </button>

        </nav>

        {/* USER */}

        <div className="user-area">

          <div className="avatar">
            {(user.name || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="user-name">

            {user.name ||
              "Student"}

            <small>
              {user.email || ""}
            </small>

          </div>

          <button
            type="button"
            className="logout"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* ==========================================
          MAIN
      =========================================== */}

      <main className="dash-main">

        {/* ========================================
            HERO
        ========================================= */}

        <section className="hero-card">

          <div>

            <span className="eyebrow">
              STUDENT DASHBOARD
            </span>

            <h1>
              Welcome back{" "}
              <span>
                {user.name ||
                  "Student"}
              </span>.
            </h1>

            <p>
              Choose a subject and
              turn a few minutes into
              measurable progress.
            </p>

            <button
              type="button"
              className="hero-btn"
              onClick={() =>
                document
                  .getElementById(
                    "categories"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                  })
              }
            >
              Explore quizzes

              <span>
                →
              </span>
            </button>

          </div>

          <div className="hero-orbit">

            <div className="orbit-ring"></div>

            <div className="orbit-core">
              Q
            </div>

            <span className="orbit-star s1">
              ✦
            </span>

            <span className="orbit-star s2">
              ✦
            </span>

            <span className="orbit-star s3">
              ✦
            </span>

          </div>

        </section>

        {/* ========================================
            STATS
        ========================================= */}

        <section className="stats-grid">

          <div className="stat-card">

            <span>
              ◈
            </span>

            <div>

              <small>
                AVAILABLE SUBJECTS
              </small>

              <strong>
                {String(
                  categories.length
                ).padStart(2, "0")}
              </strong>

            </div>

          </div>

          <div className="stat-card">

            <span>
              ✓
            </span>

            <div>

              <small>
                QUESTIONS READY
              </small>

              <strong>
                {totalQuestions}
              </strong>

            </div>

          </div>

          <div className="stat-card">

            <span>
              ⚡
            </span>

            <div>

              <small>
                QUIZ MODE
              </small>

              <strong>
                Timed
              </strong>

            </div>

          </div>

          <div className="stat-card">

            <span>
              🏆
            </span>

            <div>

              <small>
                LEADERBOARD
              </small>

              <strong>
                Live
              </strong>

            </div>

          </div>

        </section>

        {/* ========================================
            SECTION TITLE
        ========================================= */}

        <section
          id="categories"
          className="section-head"
        >

          <div>

            <span className="eyebrow">
              PICK YOUR CHALLENGE
            </span>

            <h2>
              Explore subjects
            </h2>

          </div>

          <span className="section-note">
            Select one to begin
          </span>

        </section>

        {/* ========================================
            TOPICS
        ========================================= */}

        {loadingTopics && (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
            }}
          >
            Loading topics...
          </div>
        )}

        {!loadingTopics &&
          topicError && (
            <div
              style={{
                padding: "25px",
                borderRadius: "16px",
                textAlign: "center",
                background:
                  "rgba(255,70,70,.12)",
                border:
                  "1px solid rgba(255,100,100,.25)",
              }}
            >
              <strong>
                Unable to load topics
              </strong>

              <p>
                {topicError}
              </p>

              <button
                type="button"
                onClick={
                  loadTopics
                }
                style={{
                  padding:
                    "10px 20px",
                  borderRadius:
                    "10px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          )}

        {!loadingTopics &&
          !topicError &&
          categories.length === 0 && (
            <div
              style={{
                padding: "50px",
                textAlign: "center",
              }}
            >
              <h3>
                No topics available
              </h3>

              <p>
                Admin can create a
                new topic from the
                Admin → Topics page.
              </p>
            </div>
          )}

        {!loadingTopics &&
          !topicError &&
          categories.length > 0 && (
            <section className="category-grid">

              {categories.map(
                (category) => (

                  <button
                    key={
                      category._id ||
                      category.name
                    }
                    type="button"
                    onClick={() =>
                      setSelected(
                        category.name
                      )
                    }
                    className={`category-card ${
                      selected ===
                      category.name
                        ? "selected"
                        : ""
                    }`}
                  >

                    <div
                      className={`category-icon ${category.tone}`}
                    >
                      {
                        category.icon
                      }
                    </div>

                    <div className="category-copy">

                      <div className="category-title">

                        <h3>
                          {
                            category.name
                          }
                        </h3>

                        <span>
                          {
                            category.count
                          }{" "}
                          Q
                        </span>

                      </div>

                      <p>
                        {
                          category.description
                        }
                      </p>

                      <small
                        style={{
                          opacity: 0.7,
                        }}
                      >
                        ⏱{" "}
                        {
                          category.durationSeconds
                        }{" "}
                        sec/question
                      </small>

                    </div>

                    <span className="category-arrow">
                      →
                    </span>

                  </button>

                )
              )}

            </section>
          )}

        {/* ========================================
            START QUIZ
        ========================================= */}

        <div className="start-row">

          <div>

            {selected ? (
              <>
                <b>
                  {selected}
                </b>{" "}
                selected
              </>
            ) : (
              <>
                Choose a subject to
                unlock the quiz
              </>
            )}

          </div>

          <button
            type="button"
            disabled={
              !selected
            }
            onClick={
              startQuiz
            }
          >
            Start Quiz

            <span>
              →
            </span>
          </button>

        </div>

      </main>

    </div>
  );
}