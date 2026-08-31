import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function Topics() {
  const [topics, setTopics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Time for EACH question
  const [questionTimeSeconds, setQuestionTimeSeconds] =
    useState(30);

  const [isActive, setIsActive] = useState(true);

  const [editingId, setEditingId] = useState(null);

  /*
  ==================================================
  TOKEN
  ==================================================
  */

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("authToken") ||
      ""
    );
  };

  /*
  ==================================================
  HEADERS
  ==================================================
  */

  const getHeaders = () => {
    const token = getToken();

    return {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  /*
  ==================================================
  LOAD TOPICS
  ==================================================
  */

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/topics`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load topics"
        );
      }

      const topicList = Array.isArray(data)
        ? data
        : data.topics ||
          data.data ||
          [];

      setTopics(topicList);
    } catch (err) {
      console.error(
        "Load topics error:",
        err
      );

      setError(
        err.message ||
          "Unable to load topics"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  ==================================================
  INITIAL LOAD
  ==================================================
  */

  useEffect(() => {
    loadTopics();
  }, []);

  /*
  ==================================================
  RESET FORM
  ==================================================
  */

  const resetForm = () => {
    setName("");
    setDescription("");
    setQuestionTimeSeconds(30);
    setIsActive(true);
    setEditingId(null);
  };

  /*
  ==================================================
  VALIDATE TIME
  ==================================================
  */

  const validateQuestionTime = () => {
    const seconds = Number(
      questionTimeSeconds
    );

    if (
      !Number.isInteger(seconds) ||
      seconds < 5 ||
      seconds > 60
    ) {
      alert(
        "Time per question must be between 5 and 60 seconds."
      );

      return null;
    }

    return seconds;
  };

  /*
  ==================================================
  CREATE TOPIC
  ==================================================
  */

  const createTopic = async (e) => {
    e.preventDefault();

    const cleanName = name.trim();

    if (!cleanName) {
      alert(
        "Please enter a topic name."
      );

      return;
    }

    const seconds =
      validateQuestionTime();

    if (seconds === null) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/admin/topics`,
        {
          method: "POST",
          headers: getHeaders(),

          body: JSON.stringify({
            name: cleanName,

            description:
              description.trim(),

            questionTimeSeconds:
              seconds,

            isActive,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create topic"
        );
      }

      alert(
        "Topic created successfully."
      );

      resetForm();

      await loadTopics();
    } catch (err) {
      console.error(
        "Create topic error:",
        err
      );

      alert(
        err.message ||
          "Unable to create topic."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  ==================================================
  START EDIT
  ==================================================
  */

  const startEdit = (topic) => {
    setEditingId(
      topic._id || topic.id
    );

    setName(topic.name || "");

    setDescription(
      topic.description || ""
    );

    setQuestionTimeSeconds(
      topic.questionTimeSeconds ||
        30
    );

    setIsActive(
      topic.isActive !== false
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  ==================================================
  UPDATE TOPIC
  ==================================================
  */

  const updateTopic = async (e) => {
    e.preventDefault();

    if (!editingId) {
      return;
    }

    const cleanName = name.trim();

    if (!cleanName) {
      alert(
        "Please enter a topic name."
      );

      return;
    }

    const seconds =
      validateQuestionTime();

    if (seconds === null) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/admin/topics/${editingId}`,
        {
          method: "PUT",
          headers: getHeaders(),

          body: JSON.stringify({
            name: cleanName,

            description:
              description.trim(),

            questionTimeSeconds:
              seconds,

            isActive,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update topic"
        );
      }

      alert(
        "Topic updated successfully."
      );

      resetForm();

      await loadTopics();
    } catch (err) {
      console.error(
        "Update topic error:",
        err
      );

      alert(
        err.message ||
          "Unable to update topic."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  ==================================================
  DELETE TOPIC
  ==================================================
  */

  const deleteTopic = async (topic) => {
    const id =
      topic._id || topic.id;

    if (!id) {
      alert(
        "Topic ID not found."
      );

      return;
    }

    const questionCount =
      Number(
        topic.questionCount || 0
      );

    let message =
      `Are you sure you want to delete "${topic.name}"?`;

    if (questionCount > 0) {
      message +=
        `\n\nWARNING: This topic has ${questionCount} question(s). ` +
        "Deleting the topic will also delete all its questions.";
    }

    const confirmDelete =
      window.confirm(message);

    if (!confirmDelete) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_URL}/admin/topics/${id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete topic"
        );
      }

      alert(
        data.message ||
          "Topic deleted successfully."
      );

      await loadTopics();

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error(
        "Delete topic error:",
        err
      );

      alert(
        err.message ||
          "Unable to delete topic."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  ==================================================
  CANCEL EDIT
  ==================================================
  */

  const cancelEdit = () => {
    resetForm();
  };

  /*
  ==================================================
  FORMAT TIME
  ==================================================
  */

  const formatSeconds = (seconds) => {
    const value = Number(seconds);

    if (value < 60) {
      return `${value} sec`;
    }

    const minutes =
      Math.floor(value / 60);

    const remaining =
      value % 60;

    if (remaining === 0) {
      return `${minutes} min`;
    }

    return `${minutes} min ${remaining} sec`;
  };

  /*
  ==================================================
  RENDER
  ==================================================
  */

  return (
    <div style={styles.page}>
      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <div style={styles.smallTitle}>
            ADMINISTRATION
          </div>

          <h1 style={styles.title}>
            Topics
          </h1>

          <p style={styles.subtitle}>
            Manage topics and control the
            time allowed for every question.
          </p>
        </div>

        <button
          onClick={loadTopics}
          style={styles.refreshButton}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      <div style={styles.grid}>
        {/* ========================================
            FORM
        ======================================== */}

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            {editingId
              ? "Edit Topic"
              : "Create Topic"}
          </h2>

          <p
            style={
              styles.formDescription
            }
          >
            {editingId
              ? "Update topic details and question timer."
              : "Create a new quiz topic."}
          </p>

          <form
            onSubmit={
              editingId
                ? updateTopic
                : createTopic
            }
          >
            {/* NAME */}

            <label style={styles.label}>
              Topic Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Example: JavaScript"
              style={styles.input}
              disabled={saving}
            />

            {/* DESCRIPTION */}

            <label style={styles.label}>
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Enter topic description"
              style={styles.textarea}
              disabled={saving}
            />

            {/* QUESTION TIMER */}

            <label style={styles.label}>
              Time Per Question
            </label>

            <div
              style={
                styles.timerInputWrapper
              }
            >
              <input
                type="number"
                min="5"
                max="60"
                step="1"
                value={
                  questionTimeSeconds
                }
                onChange={(e) =>
                  setQuestionTimeSeconds(
                    e.target.value
                  )
                }
                style={
                  styles.timerInput
                }
                disabled={saving}
              />

              <span
                style={
                  styles.timerUnit
                }
              >
                seconds
              </span>
            </div>

            <p
              style={
                styles.helperText
              }
            >
              Choose any value from
              <strong> 5 </strong>
              to
              <strong> 60 seconds</strong>.
              This timer will apply to
              every question in this topic.
            </p>

            {/* ACTIVE */}

            <label
              style={
                styles.checkboxRow
              }
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) =>
                  setIsActive(
                    e.target.checked
                  )
                }
                disabled={saving}
              />

              <span>
                Topic is active
              </span>
            </label>

            {/* BUTTONS */}

            <div
              style={
                styles.formButtons
              }
            >
              <button
                type="submit"
                style={
                  styles.primaryButton
                }
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "✓ Update Topic"
                  : "+ Create Topic"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={
                    cancelEdit
                  }
                  style={
                    styles.cancelButton
                  }
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ========================================
            TOPIC LIST
        ======================================== */}

        <div style={styles.card}>
          <div
            style={
              styles.listHeader
            }
          >
            <div>
              <h2
                style={
                  styles.cardTitle
                }
              >
                Existing Topics
              </h2>

              <p
                style={styles.count}
              >
                {topics.length} topic
                {topics.length !==
                1
                  ? "s"
                  : ""}
              </p>
            </div>
          </div>

          {/* LOADING */}

          {loading && (
            <div
              style={styles.message}
            >
              <div
                style={
                  styles.loadingIcon
                }
              >
                ⏳
              </div>

              Loading topics...
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div
              style={styles.error}
            >
              <strong>
                Unable to load topics
              </strong>

              <p>{error}</p>

              <button
                onClick={
                  loadTopics
                }
                style={
                  styles.retryButton
                }
              >
                Retry
              </button>
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            topics.length === 0 && (
              <div
                style={
                  styles.empty
                }
              >
                <div
                  style={
                    styles.emptyIcon
                  }
                >
                  📚
                </div>

                <strong>
                  No topics available
                </strong>

                <p>
                  Create your first
                  topic.
                </p>
              </div>
            )}

          {/* TOPICS */}

          {!loading &&
            !error &&
            topics.length > 0 &&
            topics.map((topic) => {
              const id =
                topic._id ||
                topic.id;

              const questionCount =
                Number(
                  topic.questionCount ||
                    0
                );

              const seconds =
                Number(
                  topic.questionTimeSeconds ||
                    30
                );

              const active =
                topic.isActive !==
                false;

              return (
                <div
                  key={id}
                  style={
                    styles.topicRow
                  }
                >
                  <div
                    style={
                      styles.topicInfo
                    }
                  >
                    <div
                      style={
                        styles.topicTitleRow
                      }
                    >
                      <h3
                        style={
                          styles.topicName
                        }
                      >
                        {topic.name}
                      </h3>

                      <span
                        style={{
                          ...styles.statusBadge,

                          ...(active
                            ? styles.activeBadge
                            : styles.inactiveBadge),
                        }}
                      >
                        {active
                          ? "ACTIVE"
                          : "INACTIVE"}
                      </span>
                    </div>

                    <p
                      style={
                        styles.topicDescription
                      }
                    >
                      {topic.description ||
                        "No description available"}
                    </p>

                    <div
                      style={
                        styles.topicMeta
                      }
                    >
                      <span
                        style={
                          styles.metaItem
                        }
                      >
                        ⏱️
                        <strong>
                          {" "}
                          {formatSeconds(
                            seconds
                          )}
                        </strong>
                        {" "}per question
                      </span>

                      <span
                        style={
                          styles.metaItem
                        }
                      >
                        📝
                        <strong>
                          {" "}
                          {questionCount}
                        </strong>{" "}
                        question
                        {questionCount !==
                        1
                          ? "s"
                          : ""}
                      </span>
                    </div>
                  </div>

                  <div
                    style={
                      styles.topicActions
                    }
                  >
                    <button
                      onClick={() =>
                        startEdit(
                          topic
                        )
                      }
                      style={
                        styles.editButton
                      }
                      disabled={saving}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteTopic(
                          topic
                        )
                      }
                      style={
                        styles.deleteButton
                      }
                      disabled={saving}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

/*
====================================================
STYLES
====================================================
*/

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px",
    background:
      "linear-gradient(135deg, #071a2d, #073b5c, #0577a8)",
    color: "#ffffff",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    marginBottom: "35px",
    gap: "20px",
  },

  smallTitle: {
    fontSize: "13px",
    letterSpacing: "3px",
    fontWeight: "700",
    color: "#6ee7f9",
    marginBottom: "8px",
  },

  title: {
    fontSize: "42px",
    margin: "0 0 8px",
  },

  subtitle: {
    margin: 0,
    color: "#c5e8f4",
    fontSize: "16px",
  },

  refreshButton: {
    padding: "12px 20px",
    borderRadius: "12px",
    border:
      "1px solid rgba(255,255,255,.2)",
    background:
      "rgba(255,255,255,.1)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "15px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(300px, 380px) 1fr",
    gap: "25px",
    alignItems: "start",
  },

  card: {
    background:
      "rgba(255,255,255,.09)",
    border:
      "1px solid rgba(255,255,255,.15)",
    borderRadius: "22px",
    padding: "25px",
    backdropFilter: "blur(15px)",
    boxShadow:
      "0 20px 50px rgba(0,0,0,.2)",
  },

  cardTitle: {
    margin: "0 0 8px",
    fontSize: "22px",
  },

  formDescription: {
    margin:
      "0 0 20px",
    color: "#a9dce9",
    fontSize: "14px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    marginTop: "18px",
    color: "#d7f7ff",
    fontSize: "14px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    borderRadius: "10px",
    border:
      "1px solid rgba(255,255,255,.2)",
    background:
      "rgba(0,0,0,.2)",
    color: "#ffffff",
    outline: "none",
    fontSize: "14px",
  },

  textarea: {
    width: "100%",
    minHeight: "100px",
    boxSizing: "border-box",
    padding: "13px",
    borderRadius: "10px",
    border:
      "1px solid rgba(255,255,255,.2)",
    background:
      "rgba(0,0,0,.2)",
    color: "#ffffff",
    outline: "none",
    resize: "vertical",
    fontSize: "14px",
    fontFamily: "inherit",
  },

  timerInputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  timerInput: {
    width: "120px",
    boxSizing: "border-box",
    padding: "13px",
    borderRadius: "10px",
    border:
      "1px solid rgba(255,255,255,.2)",
    background:
      "rgba(0,0,0,.2)",
    color: "#ffffff",
    outline: "none",
    fontSize: "15px",
  },

  timerUnit: {
    color: "#c5e8f4",
    fontSize: "14px",
  },

  helperText: {
    margin:
      "8px 0 0",
    color: "#8fc9d8",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    marginTop: "20px",
    color: "#d7f7ff",
    fontSize: "14px",
    cursor: "pointer",
  },

  formButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "22px",
  },

  primaryButton: {
    flex: 1,
    padding: "14px",
    border: "none",
    borderRadius: "11px",
    background:
      "linear-gradient(90deg,#06b6d4,#0ea5e9)",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },

  cancelButton: {
    padding:
      "14px 18px",
    border:
      "1px solid rgba(255,255,255,.2)",
    borderRadius: "11px",
    background:
      "rgba(255,255,255,.08)",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },

  listHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  count: {
    color: "#a9dce9",
    margin:
      "0 0 20px",
  },

  topicRow: {
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: "20px",
    padding: "18px",
    marginBottom: "12px",
    borderRadius: "14px",
    background:
      "rgba(0,0,0,.15)",
    border:
      "1px solid rgba(255,255,255,.08)",
  },

  topicInfo: {
    minWidth: 0,
    flex: 1,
  },

  topicTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  topicName: {
    margin: "0",
    fontSize: "18px",
  },

  topicDescription: {
    margin:
      "7px 0 10px",
    color: "#b9dce6",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  topicMeta: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  metaItem: {
    color: "#d7f7ff",
    fontSize: "13px",
  },

  statusBadge: {
    padding:
      "4px 8px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: "800",
  },

  activeBadge: {
    background:
      "rgba(34,197,94,.18)",
    border:
      "1px solid rgba(34,197,94,.35)",
    color: "#86efac",
  },

  inactiveBadge: {
    background:
      "rgba(239,68,68,.18)",
    border:
      "1px solid rgba(239,68,68,.35)",
    color: "#fca5a5",
  },

  topicActions: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },

  editButton: {
    border:
      "1px solid rgba(96,165,250,.35)",
    background:
      "rgba(59,130,246,.15)",
    color: "#bfdbfe",
    padding:
      "9px 13px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "600",
  },

  deleteButton: {
    border:
      "1px solid rgba(255,100,100,.4)",
    background:
      "rgba(255,60,60,.15)",
    color: "#ffb5b5",
    padding:
      "9px 13px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "600",
  },

  message: {
    padding: "40px",
    textAlign: "center",
    color: "#c5e8f4",
  },

  loadingIcon: {
    fontSize: "28px",
    marginBottom: "10px",
  },

  empty: {
    padding: "40px",
    textAlign: "center",
    color: "#b9dce6",
  },

  emptyIcon: {
    fontSize: "38px",
    marginBottom: "10px",
  },

  error: {
    padding: "20px",
    borderRadius: "12px",
    background:
      "rgba(255,70,70,.12)",
    border:
      "1px solid rgba(255,100,100,.25)",
    color: "#ffd1d1",
  },

  retryButton: {
    marginTop: "10px",
    padding:
      "9px 16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};