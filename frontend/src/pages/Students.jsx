import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Students() {
  const navigate = useNavigate();

  // ==========================================
  // STUDENTS
  // ==========================================

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  // ==========================================
  // ADMINS
  // ==========================================

  const [admins, setAdmins] = useState([]);

  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");

  // ==========================================
  // PAGE STATE
  // ==========================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // AUTH CHECK
  // ==========================================

  useEffect(() => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      if (user.role !== "admin") {
        navigate("/dashboard", {
          replace: true,
        });
        return;
      }

      loadStudents();
      loadAdmins();
    } catch {
      navigate("/", {
        replace: true,
      });
    }
  }, [navigate]);

  // ==========================================
  // LOAD STUDENTS
  // ==========================================

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/users");

      const data = response.data;

      const users = Array.isArray(data.users)
        ? data.users
        : [];

      const studentUsers = users.filter(
        (user) =>
          String(user.role || "").toLowerCase() ===
          "student"
      );

      setStudents(studentUsers);
    } catch (err) {
      console.error("Load students error:", err);

      let message =
        "Unable to load students from the backend.";

      if (err.response) {
        if (err.response.status === 401) {
          message =
            "Your admin session has expired. Please login again.";
        } else if (err.response.status === 403) {
          message =
            "Admin access is required to view students.";
        } else if (err.response.status === 404) {
          message =
            "Backend route /api/admin/users was not found.";
        } else if (err.response.data?.message) {
          message = err.response.data.message;
        }
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD ADMINS
  // ==========================================

  const loadAdmins = async () => {
    try {
      const response = await API.get("/admin/admins");

      const data = response.data;

      const adminUsers = Array.isArray(data.admins)
        ? data.admins
        : [];

      setAdmins(adminUsers);
    } catch (err) {
      console.error("Load admins error:", err);

      setAdmins([]);
    }
  };

  // ==========================================
  // FILTER STUDENTS
  // ==========================================

  const filteredStudents = useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) {
      return students;
    }

    return students.filter((student) => {
      const name = String(
        student.name || ""
      ).toLowerCase();

      const email = String(
        student.email || ""
      ).toLowerCase();

      return (
        name.includes(text) ||
        email.includes(text)
      );
    });
  }, [students, search]);

  // ==========================================
  // DELETE STUDENT
  // ==========================================

  const deleteStudent = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student account?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`/admin/users/${id}`);

      setStudents((current) =>
        current.filter(
          (student) => student._id !== id
        )
      );

      alert(
        "Student account deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete student error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to delete the student. Please try again."
      );
    }
  };

  // ==========================================
  // ADMIN FORM CHANGE
  // ==========================================

  const handleAdminChange = (event) => {
    const { name, value } = event.target;

    setAdminForm((current) => ({
      ...current,
      [name]: value,
    }));

    setAdminError("");
    setAdminSuccess("");
  };

  // ==========================================
  // ADD ADMIN
  // ==========================================

  const addAdmin = async (event) => {
    event.preventDefault();

    setAdminError("");
    setAdminSuccess("");

    const name = adminForm.name.trim();

    const email = adminForm.email
      .trim()
      .toLowerCase();

    const password = adminForm.password;

    if (!name || !email || !password) {
      setAdminError(
        "Name, email and password are required."
      );
      return;
    }

    if (name.length < 2) {
      setAdminError(
        "Admin name must contain at least 2 characters."
      );
      return;
    }

    if (password.length < 6) {
      setAdminError(
        "Admin password must contain at least 6 characters."
      );
      return;
    }

    try {
      setAdminLoading(true);

      const response = await API.post(
        "/admin/admins",
        {
          name,
          email,
          password,
        }
      );

      const createdAdmin =
        response.data?.admin;

      if (createdAdmin) {
        setAdmins((current) => [
          createdAdmin,
          ...current,
        ]);
      } else {
        await loadAdmins();
      }

      setAdminForm({
        name: "",
        email: "",
        password: "",
      });

      setAdminSuccess(
        "New administrator created successfully."
      );

      setShowAdminForm(false);
    } catch (err) {
      console.error(
        "Add admin error:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Unable to create administrator.";

      setAdminError(message);
    } finally {
      setAdminLoading(false);
    }
  };

  // ==========================================
  // DELETE ADMIN
  // ==========================================

  const deleteAdmin = async (admin) => {
    if (!admin?._id) {
      alert("Invalid administrator ID.");
      return;
    }

    // Get currently logged-in admin
    let currentUser = {};

    try {
      currentUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );
    } catch {
      currentUser = {};
    }

    // Prevent deleting yourself from this page
    const currentUserId =
      currentUser._id ||
      currentUser.id ||
      currentUser.userId;

    if (
      currentUserId &&
      String(currentUserId) ===
        String(admin._id)
    ) {
      alert(
        "You cannot delete the administrator account you are currently using."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete administrator "${admin.name || admin.email}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(
        `/admin/admins/${admin._id}`
      );

      setAdmins((current) =>
        current.filter(
          (item) =>
            String(item._id) !==
            String(admin._id)
        )
      );

      setAdminSuccess(
        "Administrator deleted successfully."
      );

      setTimeout(() => {
        setAdminSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Delete admin error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to delete administrator. Please try again."
      );
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // GET INITIALS
  // ==========================================

  const getInitials = (name) => {
    if (!name) {
      return "U";
    }

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("");
  };

  // ==========================================
  // REFRESH EVERYTHING
  // ==========================================

  const refreshPage = () => {
    loadStudents();
    loadAdmins();
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div style={styles.page}>

      <div style={styles.backgroundGlowOne}></div>
      <div style={styles.backgroundGlowTwo}></div>

      {/* ======================================
          HEADER
      ====================================== */}

      <header style={styles.header}>

        <div style={styles.brandArea}>

          <div style={styles.logo}>
            Q
          </div>

          <div>
            <div style={styles.brandName}>
              QuizNova
            </div>

            <div style={styles.brandSubtitle}>
              ADMIN PANEL
            </div>
          </div>

        </div>

        <nav style={styles.navigation}>

          <Link
            to="/admin"
            style={styles.navLink}
          >
            Dashboard
          </Link>

          <Link
            to="/admin/students"
            style={styles.activeNavLink}
          >
            Students
          </Link>

          <Link
            to="/admin/topics"
            style={styles.navLink}
          >
            Topics
          </Link>

          <Link
            to="/admin/questions"
            style={styles.navLink}
          >
            Questions
          </Link>

        </nav>

        <button
          style={styles.backButton}
          onClick={() =>
            navigate("/admin")
          }
        >
          ← Admin Dashboard
        </button>

      </header>

      {/* ======================================
          MAIN
      ====================================== */}

      <main style={styles.main}>

        {/* HEADING */}

        <section style={styles.headingSection}>

          <div>

            <div style={styles.eyebrow}>
              USER MANAGEMENT
            </div>

            <h1 style={styles.title}>
              Registered Students
            </h1>

            <p style={styles.description}>
              Manage student accounts
              and administrators on
              QuizNova.
            </p>

          </div>

          <button
            style={styles.refreshButton}
            onClick={refreshPage}
          >
            ↻ Refresh
          </button>

        </section>

        {/* ======================================
            STATISTICS
        ====================================== */}

        <section style={styles.statsGrid}>

          <div style={styles.statCard}>

            <div style={styles.statIcon}>
              👥
            </div>

            <div>

              <div style={styles.statLabel}>
                Total Students
              </div>

              <div style={styles.statValue}>
                {students.length}
              </div>

              <div style={styles.statDescription}>
                Student accounts
              </div>

            </div>

          </div>

          <div style={styles.statCard}>

            <div style={styles.statIcon}>
              ✓
            </div>

            <div>

              <div style={styles.statLabel}>
                Showing
              </div>

              <div style={styles.statValue}>
                {filteredStudents.length}
              </div>

              <div style={styles.statDescription}>
                Matching students
              </div>

            </div>

          </div>

          <div style={styles.statCard}>

            <div style={styles.statIcon}>
              🛡️
            </div>

            <div>

              <div style={styles.statLabel}>
                Administrators
              </div>

              <div style={styles.statValue}>
                {admins.length}
              </div>

              <div style={styles.statDescription}>
                Admin accounts
              </div>

            </div>

          </div>

        </section>

        {/* ======================================
            ADMIN MANAGEMENT
        ====================================== */}

        <section style={styles.adminManagementCard}>

          <div style={styles.adminManagementHeader}>

            <div>

              <div style={styles.eyebrow}>
                ADMINISTRATOR MANAGEMENT
              </div>

              <h2 style={styles.adminManagementTitle}>
                Manage Administrators
              </h2>

              <p style={styles.adminManagementText}>
                Add or delete administrators
                who can access the QuizNova
                Admin Panel.
              </p>

            </div>

            <button
              style={styles.addAdminButton}
              onClick={() => {
                setShowAdminForm(
                  !showAdminForm
                );
                setAdminError("");
                setAdminSuccess("");
              }}
            >
              {showAdminForm
                ? "✕ Close"
                : "+ Add Admin"}
            </button>

          </div>

          {/* ==================================
              SUCCESS MESSAGE
          ================================== */}

          {adminSuccess && (
            <div style={styles.successCard}>

              <div style={styles.successIcon}>
                ✓
              </div>

              <div>

                <div style={styles.successTitle}>
                  Success
                </div>

                <div style={styles.successText}>
                  {adminSuccess}
                </div>

              </div>

            </div>
          )}

          {/* ==================================
              ADD ADMIN FORM
          ================================== */}

          {showAdminForm && (
            <form
              onSubmit={addAdmin}
              style={styles.adminForm}
            >

              <div style={styles.formTitle}>
                Create New Administrator
              </div>

              <div style={styles.formGrid}>

                <div style={styles.formGroup}>

                  <label style={styles.formLabel}>
                    Admin Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={adminForm.name}
                    onChange={handleAdminChange}
                    placeholder="Enter admin name"
                    style={styles.formInput}
                    autoComplete="off"
                  />

                </div>

                <div style={styles.formGroup}>

                  <label style={styles.formLabel}>
                    Admin Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={adminForm.email}
                    onChange={handleAdminChange}
                    placeholder="Enter admin email"
                    style={styles.formInput}
                    autoComplete="off"
                  />

                </div>

                <div style={styles.formGroup}>

                  <label style={styles.formLabel}>
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={adminForm.password}
                    onChange={handleAdminChange}
                    placeholder="Minimum 6 characters"
                    style={styles.formInput}
                    autoComplete="new-password"
                  />

                </div>

              </div>

              {adminError && (
                <div style={styles.formError}>
                  ⚠ {adminError}
                </div>
              )}

              <div style={styles.formActions}>

                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => {
                    setShowAdminForm(false);
                    setAdminError("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={styles.createAdminButton}
                  disabled={adminLoading}
                >
                  {adminLoading
                    ? "Creating..."
                    : "Create Administrator"}
                </button>

              </div>

            </form>
          )}
        

          {/* ==================================
              ADMIN LIST
          ================================== */}

          {admins.length > 0 && (
            <div style={styles.adminList}>

              <div style={styles.adminListTitle}>
                Current Administrators
              </div>

              <div style={styles.adminGrid}>

                {admins.map((admin) => (

                  <div
                    key={admin._id}
                    style={styles.adminCard}
                  >

                    <div style={styles.adminAvatar}>
                      {getInitials(admin.name)}
                    </div>

                    <div style={styles.adminInfo}>

                      <div style={styles.adminName}>
                        {admin.name ||
                          "Administrator"}
                      </div>

                      <div style={styles.adminEmail}>
                        {admin.email || "—"}
                      </div>

                      <div style={styles.adminMeta}>

                        <span style={styles.adminBadge}>
                          ADMIN
                        </span>

                        <span>
                          Joined{" "}
                          {formatDate(
                            admin.createdAt
                          )}
                        </span>

                      </div>

                    </div>

                    {/* DELETE ADMIN BUTTON */}

                    <button
                      type="button"
                      style={styles.deleteAdminButton}
                      onClick={() =>
                        deleteAdmin(admin)
                      }
                    >
                      Delete
                    </button>

                  </div>

                ))}

              </div>

            </div>
          )}

          {/* NO ADMINS */}

          {admins.length === 0 && (
            <div style={styles.noAdmins}>
              No administrator accounts found.
            </div>
          )}

        </section>

        {/* ======================================
            SEARCH
        ====================================== */}

        <section style={styles.searchCard}>

          <span style={styles.searchIcon}>
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            style={styles.searchInput}
          />

          {search && (
            <button
              style={styles.clearButton}
              onClick={() => setSearch("")}
            >
              Clear
            </button>
          )}

        </section>

        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <section style={styles.errorCard}>

            <div style={styles.errorIcon}>
              ⚠
            </div>

            <div style={{ flex: 1 }}>

              <div style={styles.errorTitle}>
                Unable to load students
              </div>

              <div style={styles.errorText}>
                {error}
              </div>

              <button
                style={styles.tryAgainButton}
                onClick={loadStudents}
              >
                Try Again
              </button>

            </div>

          </section>
        )}

        {/* ======================================
            LOADING
        ====================================== */}

        {loading && !error && (
          <section style={styles.loadingCard}>

            <div style={styles.spinner}></div>

            <div>

              <div style={styles.loadingTitle}>
                Loading students...
              </div>

              <div style={styles.loadingText}>
                Connecting to the
                QuizNova backend.
              </div>

            </div>

          </section>
        )}

        {/* ======================================
            STUDENT TABLE
        ====================================== */}

        {!loading && !error && (
          <section style={styles.tableCard}>

            <div style={styles.tableHeader}>

              <div>

                <h2 style={styles.tableTitle}>
                  Student Accounts
                </h2>

                <p style={styles.tableSubtitle}>
                  {filteredStudents.length}{" "}
                  student
                  {filteredStudents.length !== 1
                    ? "s"
                    : ""}{" "}
                  found
                </p>

              </div>

            </div>

            {filteredStudents.length === 0 ? (

              <div style={styles.emptyState}>

                <div style={styles.emptyIcon}>
                  👤
                </div>

                <h3 style={styles.emptyTitle}>
                  {search
                    ? "No students found"
                    : "No student accounts yet"}
                </h3>

                <p style={styles.emptyText}>
                  {search
                    ? "Try searching with another name or email."
                    : "Registered student accounts will appear here."}
                </p>

              </div>

            ) : (

              <div style={styles.tableWrapper}>

                <table style={styles.table}>

                  <thead>

                    <tr>

                      <th style={styles.th}>
                        Student
                      </th>

                      <th style={styles.th}>
                        Email
                      </th>

                      <th style={styles.th}>
                        Role
                      </th>

                      <th style={styles.th}>
                        Registered
                      </th>

                      <th style={styles.th}>
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredStudents.map(
                      (student) => (

                        <tr
                          key={student._id}
                          style={styles.tr}
                        >

                          <td style={styles.td}>

                            <div
                              style={
                                styles.studentCell
                              }
                            >

                              <div
                                style={
                                  styles.avatar
                                }
                              >
                                {getInitials(
                                  student.name
                                )}
                              </div>

                              <div>

                                <div
                                  style={
                                    styles.studentName
                                  }
                                >
                                  {student.name ||
                                    "Unknown Student"}
                                </div>

                                <div
                                  style={
                                    styles.studentId
                                  }
                                >
                                  ID:{" "}
                                  {student._id
                                    ? String(
                                        student._id
                                      ).slice(-8)
                                    : "—"}
                                </div>

                              </div>

                            </div>

                          </td>

                          <td style={styles.td}>

                            <span
                              style={styles.email}
                            >
                              {student.email || "—"}
                            </span>

                          </td>

                          <td style={styles.td}>

                            <span
                              style={
                                styles.roleBadge
                              }
                            >
                              STUDENT
                            </span>

                          </td>

                          <td style={styles.td}>

                            <span style={styles.date}>
                              {formatDate(
                                student.createdAt
                              )}
                            </span>

                          </td>

                          <td style={styles.td}>

                            <button
                              style={
                                styles.deleteButton
                              }
                              onClick={() =>
                                deleteStudent(
                                  student._id
                                )
                              }
                            >
                              Delete
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>
        )}

        {/* ======================================
            CONTENT MANAGEMENT
        ====================================== */}

        <section style={styles.managementSection}>

          <div>

            <div style={styles.eyebrow}>
              CONTENT MANAGEMENT
            </div>

            <h2 style={styles.managementTitle}>
              Manage Quiz Content
            </h2>

            <p style={styles.managementText}>
              Use the admin controls below
              to manage Topics and Questions.
            </p>

          </div>

          <div style={styles.managementButtons}>

            <button
              style={styles.managementButton}
              onClick={() =>
                navigate("/admin/topics")
              }
            >

              <span
                style={
                  styles.managementButtonIcon
                }
              >
                📚
              </span>

              <span>

                <strong
                  style={
                    styles.managementButtonTitle
                  }
                >
                  Topics
                </strong>

                <small
                  style={
                    styles.managementButtonText
                  }
                >
                  Create and manage quiz
                  topics
                </small>

              </span>

              <span style={styles.arrow}>
                →
              </span>

            </button>

            <button
              style={styles.managementButton}
              onClick={() =>
                navigate("/admin/questions")
              }
            >

              <span
                style={
                  styles.managementButtonIcon
                }
              >
                ❓
              </span>

              <span>

                <strong
                  style={
                    styles.managementButtonTitle
                  }
                >
                  Questions
                </strong>

                <small
                  style={
                    styles.managementButtonText
                  }
                >
                  Add and manage quiz
                  questions
                </small>

              </span>

              <span style={styles.arrow}>
                →
              </span>

            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(0, 195, 255, 0.16), transparent 35%), radial-gradient(circle at bottom right, rgba(0, 120, 255, 0.12), transparent 35%), #061426",
    color: "#ffffff",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },

  backgroundGlowOne: {
    position: "fixed",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background:
      "rgba(0, 191, 255, 0.08)",
    filter: "blur(90px)",
    top: "-180px",
    left: "-150px",
    pointerEvents: "none",
  },

  backgroundGlowTwo: {
    position: "fixed",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background:
      "rgba(30, 100, 255, 0.08)",
    filter: "blur(100px)",
    bottom: "-180px",
    right: "-150px",
    pointerEvents: "none",
  },

  header: {
    minHeight: "76px",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    borderBottom:
      "1px solid rgba(255,255,255,0.08)",
    background:
      "rgba(5, 19, 36, 0.88)",
    backdropFilter: "blur(18px)",
    position: "sticky",
    top: 0,
    zIndex: 20,
  },

  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: "180px",
  },

  logo: {
    width: "42px",
    height: "42px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: "22px",
    background:
      "linear-gradient(135deg, #19c7ff 0%, #3478ff 100%)",
    boxShadow:
      "0 8px 30px rgba(0,170,255,0.28)",
  },

  brandName: {
    fontSize: "18px",
    fontWeight: 800,
  },

  brandSubtitle: {
    fontSize: "9px",
    letterSpacing: "2px",
    color: "#54cfff",
    marginTop: "2px",
  },

  navigation: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flex: 1,
    justifyContent: "center",
  },

  navLink: {
    color: "#9eb1c8",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
  },

  activeNavLink: {
    color: "#ffffff",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 700,
    background:
      "rgba(37, 173, 255, 0.16)",
    border:
      "1px solid rgba(37, 173, 255, 0.22)",
  },

  backButton: {
    border:
      "1px solid rgba(255,255,255,0.12)",
    background:
      "rgba(255,255,255,0.05)",
    color: "#dbeafe",
    padding: "10px 15px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
  },

  main: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "44px 32px 80px",
    position: "relative",
    zIndex: 1,
  },

  headingSection: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "28px",
  },

  eyebrow: {
    color: "#55d6ff",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "2.5px",
    marginBottom: "8px",
  },

  title: {
    margin: 0,
    fontSize: "42px",
    lineHeight: 1.1,
    fontWeight: 850,
    letterSpacing: "-1.5px",
  },

  description: {
    margin: "10px 0 0",
    color: "#9eb1c8",
    fontSize: "15px",
  },

  refreshButton: {
    border:
      "1px solid rgba(76,205,255,0.28)",
    background:
      "rgba(21,174,255,0.12)",
    color: "#75dcff",
    padding: "12px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "18px",
    marginBottom: "20px",
  },

  statCard: {
    minHeight: "120px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "22px",
    borderRadius: "20px",
    border:
      "1px solid rgba(110,210,255,0.12)",
    background:
      "linear-gradient(145deg, rgba(21,139,201,0.20), rgba(7,34,60,0.62))",
    boxShadow:
      "0 20px 50px rgba(0,0,0,0.16)",
  },

  statIcon: {
    width: "54px",
    height: "54px",
    flexShrink: 0,
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "rgba(24,190,255,0.14)",
    border:
      "1px solid rgba(70,210,255,0.15)",
    fontSize: "22px",
  },

  statLabel: {
    color: "#9fb4c9",
    fontSize: "13px",
    fontWeight: 600,
  },

  statValue: {
    fontSize: "30px",
    lineHeight: 1,
    fontWeight: 850,
    margin: "6px 0",
  },

  statDescription: {
    color: "#718ba5",
    fontSize: "11px",
  },

  adminManagementCard: {
    marginBottom: "20px",
    padding: "26px",
    borderRadius: "20px",
    border:
      "1px solid rgba(91,211,255,0.16)",
    background:
      "linear-gradient(145deg, rgba(10,66,102,0.46), rgba(7,30,52,0.82))",
    boxShadow:
      "0 20px 60px rgba(0,0,0,0.18)",
  },

  adminManagementHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },

  adminManagementTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 850,
  },

  adminManagementText: {
    margin: "7px 0 0",
    color: "#7895ae",
    fontSize: "14px",
  },

  addAdminButton: {
    flexShrink: 0,
    border: "none",
    background:
      "linear-gradient(135deg, #19c7ff, #3478ff)",
    color: "#ffffff",
    padding: "13px 19px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 800,
    boxShadow:
      "0 10px 25px rgba(25,160,255,0.22)",
  },

  adminForm: {
    marginTop: "24px",
    padding: "22px",
    borderRadius: "16px",
    border:
      "1px solid rgba(100,200,255,0.13)",
    background:
      "rgba(2,20,38,0.55)",
  },

  formTitle: {
    fontSize: "17px",
    fontWeight: 800,
    marginBottom: "18px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "15px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  formLabel: {
    color: "#a8bdd0",
    fontSize: "12px",
    fontWeight: 700,
  },

  formInput: {
    width: "100%",
    boxSizing: "border-box",
    border:
      "1px solid rgba(100,190,255,0.16)",
    outline: "none",
    background:
      "rgba(4,27,48,0.85)",
    color: "#ffffff",
    padding: "13px 14px",
    borderRadius: "10px",
    fontSize: "14px",
  },

  formError: {
    marginTop: "15px",
    padding: "12px 14px",
    borderRadius: "10px",
    background:
      "rgba(255,70,80,0.09)",
    border:
      "1px solid rgba(255,90,100,0.18)",
    color: "#ff9aa2",
    fontSize: "13px",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "18px",
  },

  cancelButton: {
    border:
      "1px solid rgba(255,255,255,0.12)",
    background:
      "rgba(255,255,255,0.05)",
    color: "#b9c9d9",
    padding: "11px 17px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 700,
  },

  createAdminButton: {
    border: "none",
    background:
      "linear-gradient(135deg, #20d5a2, #12a978)",
    color: "#ffffff",
    padding: "11px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 800,
  },

  successCard: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    marginTop: "18px",
    padding: "14px 16px",
    borderRadius: "12px",
    background:
      "rgba(30,210,155,0.08)",
    border:
      "1px solid rgba(30,210,155,0.18)",
  },

  successIcon: {
    width: "35px",
    height: "35px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "rgba(30,210,155,0.15)",
    color: "#62e5bd",
    fontWeight: 900,
  },

  successTitle: {
    fontWeight: 800,
    fontSize: "14px",
  },

  successText: {
    color: "#8fa9bd",
    fontSize: "12px",
    marginTop: "3px",
  },

  adminList: {
    marginTop: "25px",
    paddingTop: "22px",
    borderTop:
      "1px solid rgba(255,255,255,0.07)",
  },

  adminListTitle: {
    fontSize: "16px",
    fontWeight: 800,
    marginBottom: "14px",
  },

  adminGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, 1fr)",
    gap: "12px",
  },

  adminCard: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "15px",
    borderRadius: "14px",
    border:
      "1px solid rgba(90,190,255,0.10)",
    background:
      "rgba(7,31,53,0.68)",
  },

  adminAvatar: {
    width: "45px",
    height: "45px",
    flexShrink: 0,
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, rgba(255,193,7,0.25), rgba(255,116,0,0.25))",
    border:
      "1px solid rgba(255,190,70,0.18)",
    color: "#ffd36b",
    fontWeight: 900,
  },

  adminInfo: {
    minWidth: 0,
    flex: 1,
  },

  adminName: {
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "14px",
  },

  adminEmail: {
    color: "#8da5bb",
    fontSize: "12px",
    marginTop: "3px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  adminMeta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "7px",
    color: "#637e97",
    fontSize: "10px",
  },

  adminBadge: {
    padding: "4px 7px",
    borderRadius: "6px",
    background:
      "rgba(255,190,70,0.10)",
    color: "#ffd36b",
    fontWeight: 800,
    letterSpacing: "0.5px",
  },

  deleteAdminButton: {
    flexShrink: 0,
    border:
      "1px solid rgba(255,90,100,0.22)",
    background:
      "rgba(255,70,80,0.10)",
    color: "#ff8f99",
    padding: "9px 13px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "12px",
  },

  noAdmins: {
    marginTop: "20px",
    padding: "20px",
    textAlign: "center",
    color: "#7890a8",
    borderRadius: "12px",
    background:
      "rgba(255,255,255,0.03)",
  },

  searchCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "5px 8px 5px 18px",
    minHeight: "58px",
    marginBottom: "18px",
    borderRadius: "16px",
    border:
      "1px solid rgba(100,190,255,0.13)",
    background:
      "rgba(8,35,61,0.72)",
  },

  searchIcon: {
    fontSize: "27px",
    color: "#58d7ff",
    lineHeight: 1,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#ffffff",
    fontSize: "15px",
  },

  clearButton: {
    border: "none",
    background:
      "rgba(255,255,255,0.07)",
    color: "#b9c9d9",
    padding: "9px 13px",
    borderRadius: "9px",
    cursor: "pointer",
  },

  errorCard: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    padding: "20px",
    marginBottom: "18px",
    borderRadius: "16px",
    background:
      "rgba(180,55,65,0.13)",
    border:
      "1px solid rgba(255,100,110,0.20)",
  },

  errorIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "rgba(255,190,70,0.12)",
    fontSize: "22px",
  },

  errorTitle: {
    fontSize: "16px",
    fontWeight: 800,
    marginBottom: "5px",
  },

  errorText: {
    color: "#b9c9d9",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  tryAgainButton: {
    marginTop: "12px",
    border: "none",
    background: "#ffffff",
    color: "#09203a",
    padding: "9px 15px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: 800,
  },

  loadingCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "30px",
    borderRadius: "18px",
    background:
      "rgba(8,35,61,0.72)",
    border:
      "1px solid rgba(100,190,255,0.12)",
  },

  spinner: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border:
      "3px solid rgba(255,255,255,0.15)",
    borderTop:
      "3px solid #42cfff",
  },

  loadingTitle: {
    fontWeight: 800,
  },

  loadingText: {
    color: "#7890a8",
    fontSize: "13px",
    marginTop: "4px",
  },

  tableCard: {
    borderRadius: "20px",
    overflow: "hidden",
    border:
      "1px solid rgba(100,190,255,0.12)",
    background:
      "rgba(7,30,52,0.78)",
    boxShadow:
      "0 20px 60px rgba(0,0,0,0.18)",
  },

  tableHeader: {
    padding: "24px 26px",
    borderBottom:
      "1px solid rgba(255,255,255,0.07)",
  },

  tableTitle: {
    margin: 0,
    fontSize: "21px",
    fontWeight: 800,
  },

  tableSubtitle: {
    margin: "5px 0 0",
    color: "#7890a8",
    fontSize: "13px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "15px 20px",
    color: "#7896b2",
    fontSize: "11px",
    letterSpacing: "1px",
    fontWeight: 800,
    textTransform: "uppercase",
    borderBottom:
      "1px solid rgba(255,255,255,0.07)",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom:
      "1px solid rgba(255,255,255,0.055)",
  },

  td: {
    padding: "17px 20px",
    color: "#d8e5f2",
    fontSize: "14px",
    verticalAlign: "middle",
  },

  studentCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, rgba(38,194,255,0.28), rgba(61,105,255,0.28))",
    border:
      "1px solid rgba(100,210,255,0.18)",
    color: "#8be4ff",
    fontWeight: 850,
  },

  studentName: {
    fontWeight: 750,
    color: "#ffffff",
  },

  studentId: {
    marginTop: "4px",
    color: "#647d98",
    fontSize: "10px",
  },

  email: {
    color: "#9fb5cb",
  },

  roleBadge: {
    display: "inline-flex",
    padding: "6px 9px",
    borderRadius: "8px",
    background:
      "rgba(36,202,158,0.10)",
    color: "#62e5bd",
    border:
      "1px solid rgba(36,202,158,0.16)",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.7px",
  },

  date: {
    color: "#91a7bc",
  },

  deleteButton: {
    border:
      "1px solid rgba(255,100,110,0.18)",
    background:
      "rgba(255,80,90,0.08)",
    color: "#ff8f99",
    padding: "8px 12px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: 700,
  },

  emptyState: {
    textAlign: "center",
    padding: "70px 20px",
  },

  emptyIcon: {
    fontSize: "44px",
    marginBottom: "12px",
  },

  emptyTitle: {
    margin: 0,
    fontSize: "20px",
  },

  emptyText: {
    color: "#7890a8",
    marginTop: "8px",
  },

  managementSection: {
    marginTop: "25px",
    padding: "25px",
    borderRadius: "20px",
    border:
      "1px solid rgba(100,190,255,0.12)",
    background:
      "rgba(7,30,52,0.65)",
  },

  managementTitle: {
    margin: 0,
    fontSize: "24px",
  },

  managementText: {
    margin: "7px 0 20px",
    color: "#7890a8",
    fontSize: "14px",
  },

  managementButtons: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, 1fr)",
    gap: "14px",
  },

  managementButton: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    textAlign: "left",
    border:
      "1px solid rgba(90,190,255,0.13)",
    background:
      "rgba(15,74,112,0.20)",
    color: "#ffffff",
    padding: "17px",
    borderRadius: "14px",
    cursor: "pointer",
  },

  managementButtonIcon: {
    fontSize: "26px",
  },

  managementButtonTitle: {
    display: "block",
    fontSize: "15px",
    marginBottom: "4px",
  },

  managementButtonText: {
    display: "block",
    color: "#7895ae",
    fontSize: "11px",
  },

  arrow: {
    marginLeft: "auto",
    fontSize: "20px",
    color: "#5fd7ff",
  },
};