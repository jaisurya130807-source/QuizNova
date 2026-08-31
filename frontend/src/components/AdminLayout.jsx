import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

export default function AdminLayout() {
  const navigate = useNavigate();

  // -----------------------------------------
  // STUDENT VIEW
  // -----------------------------------------
  const openStudentView = () => {
    sessionStorage.setItem(
      "quiznovaAdminStudentView",
      "true"
    );

    navigate("/dashboard?adminView=true");
  };

  // -----------------------------------------
  // ADMIN USER
  // -----------------------------------------
  let user = {};

  try {
    user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch {
    user = {};
  }

  const adminName =
    user.name ||
    user.username ||
    "Admin";

  const adminEmail =
    user.email ||
    "";

  const avatarLetter =
    adminName
      .charAt(0)
      .toUpperCase() || "A";

  return (
    <div className="admin-layout">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="admin-sidebar">

        {/* -----------------------------------------------
            LOGO
        ------------------------------------------------ */}

        <div className="admin-logo">

          <div className="admin-logo-icon">
            Q
          </div>

          <div className="admin-logo-text">
            <strong>
              QuizNova
            </strong>

            <span>
              ADMIN CONSOLE
            </span>
          </div>

        </div>


        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <nav className="admin-nav">

          {/* OVERVIEW */}

          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="admin-nav-icon">
              ▣
            </span>

            <span className="admin-nav-label">
              Overview
            </span>
          </NavLink>


          {/* STUDENTS */}

          <NavLink
            to="/admin/students"
            className={({ isActive }) =>
              `admin-nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="admin-nav-icon">
              👥
            </span>

            <span className="admin-nav-label">
              Students
            </span>
          </NavLink>


          {/* TOPICS */}

          <NavLink
            to="/admin/topics"
            className={({ isActive }) =>
              `admin-nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="admin-nav-icon">
              📚
            </span>

            <span className="admin-nav-label">
              Topics
            </span>
          </NavLink>


          {/* QUESTIONS */}

          <NavLink
            to="/admin/questions"
            className={({ isActive }) =>
              `admin-nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="admin-nav-icon">
              ❓
            </span>

            <span className="admin-nav-label">
              Questions
            </span>
          </NavLink>


          {/* LEADERBOARD */}

          <NavLink
            to="/admin/leaderboard"
            className={({ isActive }) =>
              `admin-nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="admin-nav-icon">
              🏆
            </span>

            <span className="admin-nav-label">
              Leaderboard
            </span>
          </NavLink>

        </nav>


        {/* ==================================================
            BOTTOM SIDEBAR
        ================================================== */}

        <div className="admin-sidebar-bottom">

          {/* STUDENT VIEW */}

          <button
            type="button"
            className="admin-student-view"
            onClick={openStudentView}
          >

            <span className="admin-nav-icon">
              🎓
            </span>

            <span className="admin-nav-label">
              Student View
            </span>

            <span className="student-view-arrow">
              →
            </span>

          </button>


          {/* ADMIN PROFILE */}

          <div className="admin-profile">

            <div className="admin-profile-avatar">
              {avatarLetter}
            </div>

            <div className="admin-profile-info">

              <strong>
                {adminName}
              </strong>

              <span>
                {adminEmail || "Administrator"}
              </span>

            </div>

          </div>

        </div>

      </aside>


      {/* ==================================================
          MAIN AREA
      ================================================== */}

      <div className="admin-main">

        {/* -----------------------------------------------
            TOP BAR
        ------------------------------------------------ */}

        <header className="admin-topbar">

          <div className="admin-topbar-left">

            <span className="admin-topbar-label">
              ADMINISTRATION
            </span>

            <span className="admin-topbar-title">
              QuizNova Admin Console
            </span>

          </div>


          <div className="admin-topbar-right">

            <div className="admin-topbar-status">
              <span className="status-dot"></span>

              <span>
                System Online
              </span>
            </div>

          </div>

        </header>


        {/* -----------------------------------------------
            PAGE CONTENT
        ------------------------------------------------ */}

        <main className="admin-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}