import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

const emptyForm = {
  topic: "",
  question: "",
  options: ["", "", "", ""],
  answer: "",
  difficulty: "Medium",
  status: "Active",
};

export default function Questions() {
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("ALL");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [topicRes, questionRes] =
        await Promise.all([
          API.get("/admin/topics"),
          API.get("/admin/questions"),
        ]);

      const topicData =
        Array.isArray(topicRes.data)
          ? topicRes.data
          : topicRes.data?.topics || [];

      const questionData =
        Array.isArray(questionRes.data)
          ? questionRes.data
          : questionRes.data?.questions || [];

      setTopics(topicData);
      setQuestions(questionData);

      setForm((old) => ({
        ...old,
        topic:
          old.topic ||
          topicData[0]?.name ||
          "",
      }));
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load topics/questions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredQuestions = useMemo(() => {
    if (selectedTopic === "ALL") {
      return questions;
    }

    return questions.filter(
      (q) =>
        q.topic?.toLowerCase() ===
        selectedTopic.toLowerCase()
    );
  }, [questions, selectedTopic]);

  const countForTopic = (name) =>
    questions.filter(
      (q) =>
        q.topic?.toLowerCase() ===
        name.toLowerCase()
    ).length;

  const changeField = (e) => {
    setForm((old) => ({
      ...old,
      [e.target.name]: e.target.value,
    }));
  };

  const changeOption = (
    index,
    value
  ) => {
    setForm((old) => {
      const options = [...old.options];

      const oldValue =
        options[index];

      options[index] = value;

      return {
        ...old,
        options,

        answer:
          old.answer === oldValue
            ? ""
            : old.answer,
      };
    });
  };

  const resetForm = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
      options: ["", "", "", ""],
      topic:
        topics[0]?.name || "",
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    const question =
      form.question.trim();

    const options =
      form.options.map((x) =>
        x.trim()
      );

    if (!form.topic) {
      return alert(
        "Select a topic."
      );
    }

    if (!question) {
      return alert(
        "Enter a question."
      );
    }

    if (
      options.some(
        (x) => !x
      )
    ) {
      return alert(
        "Fill all 4 options."
      );
    }

    if (
      new Set(
        options.map((x) =>
          x.toLowerCase()
        )
      ).size !== 4
    ) {
      return alert(
        "All 4 options must be different."
      );
    }

    if (
      !form.answer ||
      !options.includes(
        form.answer.trim()
      )
    ) {
      return alert(
        "Select one of the options as the correct answer."
      );
    }

    const payload = {
      topic: form.topic,
      question,
      options,
      answer: form.answer.trim(),
      difficulty:
        form.difficulty,
      status: form.status,
    };

    try {
      setSaving(true);

      if (editingId) {
        await API.put(
          `/admin/questions/${editingId}`,
          payload
        );

        alert(
          "Question updated successfully."
        );
      } else {
        await API.post(
          "/admin/questions",
          payload
        );

        alert(
          "Question added successfully."
        );
      }

      resetForm();

      await loadData();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Failed to save question."
      );
    } finally {
      setSaving(false);
    }
  };

  const editQuestion = (q) => {
    setEditingId(q._id);

    setForm({
      topic: q.topic || "",

      question:
        q.question || "",

      options: [
        q.options?.[0] || "",
        q.options?.[1] || "",
        q.options?.[2] || "",
        q.options?.[3] || "",
      ],

      answer:
        q.answer || "",

      difficulty:
        q.difficulty ||
        "Medium",

      status:
        q.status ||
        "Active",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteQuestion = async (
    q
  ) => {
    if (
      !window.confirm(
        `Delete this question?\n\n${q.question}`
      )
    ) {
      return;
    }

    try {
      await API.delete(
        `/admin/questions/${q._id}`
      );

      if (
        editingId === q._id
      ) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Failed to delete question."
      );
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>
            Loading Questions...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>
          <div style={styles.eyebrow}>
            ADMINISTRATION
          </div>

          <h1 style={styles.title}>
            Question Management
          </h1>

          <p style={styles.subtitle}>
            Add, edit and delete
            questions for every topic.
          </p>
        </div>

        <button
          style={styles.secondaryButton}
          onClick={loadData}
        >
          ↻ Refresh
        </button>

      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* TOPICS */}

      <div style={styles.card}>

        <h2 style={styles.heading}>
          Topics
        </h2>

        <p style={styles.muted}>
          Choose a topic for the
          question.
        </p>

        {topics.length === 0 ? (
          <p style={styles.muted}>
            No topics found. Create a
            topic first from Admin →
            Topics.
          </p>
        ) : (
          <div style={styles.topicGrid}>

            {topics.map(
              (topic) => (
                <button
                  key={
                    topic._id ||
                    topic.name
                  }
                  type="button"
                  onClick={() =>
                    setForm(
                      (old) => ({
                        ...old,
                        topic:
                          topic.name,
                      })
                    )
                  }
                  style={{
                    ...styles.topicButton,

                    ...(form.topic ===
                    topic.name
                      ? styles.topicSelected
                      : {}),
                  }}
                >

                  <strong>
                    {topic.name}
                  </strong>

                  <span>
                    {countForTopic(
                      topic.name
                    )}{" "}
                    questions
                  </span>

                  <span>
                    ⏱{" "}
                    {
                      topic.timePerQuestion ??
                      topic.durationSeconds ??
                      30
                    }
                    s / question
                  </span>

                </button>
              )
            )}

          </div>
        )}

      </div>

      {/* ADD / EDIT */}

      <div style={styles.card}>

        <div style={styles.formHeader}>

          <div>
            <h2 style={styles.heading}>
              {editingId
                ? "Edit Question"
                : "Add New Question"}
            </h2>

            <p style={styles.muted}>
              The timer is controlled
              by the selected topic.
            </p>
          </div>

          {editingId && (
            <button
              style={
                styles.secondaryButton
              }
              type="button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}

        </div>

        <form onSubmit={submit}>

          <label style={styles.label}>
            Topic
          </label>

          <select
            name="topic"
            value={form.topic}
            onChange={changeField}
            style={styles.input}
          >

            <option value="">
              Select Topic
            </option>

            {topics.map(
              (topic) => (
                <option
                  key={
                    topic._id ||
                    topic.name
                  }
                  value={
                    topic.name
                  }
                >
                  {topic.name}
                </option>
              )
            )}

          </select>

          <label style={styles.label}>
            Question
          </label>

          <textarea
            name="question"
            value={
              form.question
            }
            onChange={changeField}
            rows="4"
            placeholder="Enter question..."
            style={styles.input}
          />

          <label style={styles.label}>
            Options — click Correct
            on one option
          </label>

          <div style={styles.options}>

            {form.options.map(
              (
                option,
                index
              ) => {

                const letter =
                  String.fromCharCode(
                    65 + index
                  );

                const correct =
                  form.answer ===
                    option &&
                  option !== "";

                return (
                  <div
                    key={letter}
                    style={{
                      ...styles.optionRow,

                      ...(correct
                        ? styles.correctRow
                        : {}),
                    }}
                  >

                    <b
                      style={
                        styles.letter
                      }
                    >
                      {letter}
                    </b>

                    <input
                      value={
                        option
                      }
                      onChange={(e) =>
                        changeOption(
                          index,
                          e.target.value
                        )
                      }
                      placeholder={`Option ${letter}`}
                      style={
                        styles.optionInput
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        option.trim() &&
                        setForm(
                          (old) => ({
                            ...old,
                            answer:
                              option.trim(),
                          })
                        )
                      }
                      style={{
                        ...styles.correctButton,

                        ...(correct
                          ? styles.correct
                          : {}),
                      }}
                    >
                      {correct
                        ? "✓ Correct"
                        : "Correct"}
                    </button>

                  </div>
                );
              }
            )}

          </div>

          <div
            style={
              styles.twoColumns
            }
          >

            <div>

              <label
                style={
                  styles.label
                }
              >
                Difficulty
              </label>

              <select
                name="difficulty"
                value={
                  form.difficulty
                }
                onChange={
                  changeField
                }
                style={
                  styles.input
                }
              >
                <option>
                  Easy
                </option>

                <option>
                  Medium
                </option>

                <option>
                  Hard
                </option>
              </select>

            </div>

            <div>

              <label
                style={
                  styles.label
                }
              >
                Status
              </label>

              <select
                name="status"
                value={
                  form.status
                }
                onChange={
                  changeField
                }
                style={
                  styles.input
                }
              >
                <option>
                  Active
                </option>

                <option>
                  Inactive
                </option>
              </select>

            </div>

          </div>

          <div style={styles.actions}>

            <button
              type="button"
              onClick={resetForm}
              style={
                styles.secondaryButton
              }
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !topics.length
              }
              style={
                styles.primaryButton
              }
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Question"
                : "+ Add Question"}
            </button>

          </div>

        </form>

      </div>

      {/* QUESTION BANK */}

      <div style={styles.card}>

        <div style={styles.formHeader}>

          <div>

            <h2 style={styles.heading}>
              Question Bank
            </h2>

            <p style={styles.muted}>
              {filteredQuestions.length}{" "}
              question(s)
            </p>

          </div>

          <select
            value={
              selectedTopic
            }
            onChange={(e) =>
              setSelectedTopic(
                e.target.value
              )
            }
            style={styles.filter}
          >

            <option value="ALL">
              All Topics
            </option>

            {topics.map(
              (topic) => (
                <option
                  key={
                    topic._id ||
                    topic.name
                  }
                  value={
                    topic.name
                  }
                >
                  {topic.name}
                </option>
              )
            )}

          </select>

        </div>

        {filteredQuestions.length ===
        0 ? (
          <p style={styles.empty}>
            No questions found for
            this selection.
          </p>
        ) : (
          filteredQuestions.map(
            (q, index) => (
              <div
                key={q._id}
                style={
                  styles.questionCard
                }
              >

                <div
                  style={
                    styles.questionTop
                  }
                >

                  <span
                    style={
                      styles.badge
                    }
                  >
                    {q.topic}
                  </span>

                  <span
                    style={
                      styles.badge
                    }
                  >
                    {q.difficulty ||
                      "Medium"}
                  </span>

                  <span
                    style={
                      styles.number
                    }
                  >
                    #{index + 1}
                  </span>

                </div>

                <h3
                  style={
                    styles.question
                  }
                >
                  {q.question}
                </h3>

                <div
                  style={
                    styles.savedOptions
                  }
                >

                  {(q.options || [])
                    .map(
                      (
                        option,
                        i
                      ) => (

                        <div
                          key={i}
                          style={{
                            ...styles.savedOption,

                            ...(option ===
                            q.answer
                              ? styles.savedCorrect
                              : {}),
                          }}
                        >

                          <b>
                            {String.fromCharCode(
                              65 + i
                            )}
                            .
                          </b>{" "}

                          {option}

                          {option ===
                            q.answer && (
                            <strong>
                              {" "}
                              ✓ Correct
                            </strong>
                          )}

                        </div>

                      )
                    )}

                </div>

                <div
                  style={
                    styles.actions
                  }
                >

                  <button
                    type="button"
                    onClick={() =>
                      editQuestion(q)
                    }
                    style={
                      styles.editButton
                    }
                  >
                    ✎ Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteQuestion(q)
                    }
                    style={
                      styles.deleteButton
                    }
                  >
                    🗑 Delete
                  </button>

                </div>

              </div>
            )
          )
        )}

      </div>

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 35,
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg,#071a2d,#073b5c,#0577a8)",
    color: "white",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-start",
    gap: 20,
    marginBottom: 25,
  },

  eyebrow: {
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: 800,
    color: "#6ee7f9",
  },

  title: {
    margin: "6px 0",
    fontSize: 38,
  },

  subtitle: {
    margin: 0,
    color: "#c5e8f4",
  },

  card: {
    marginBottom: 22,
    padding: 25,
    borderRadius: 20,
    background:
      "rgba(255,255,255,.09)",
    border:
      "1px solid rgba(255,255,255,.15)",
  },

  heading: {
    margin:
      "0 0 6px",
    fontSize: 23,
  },

  muted: {
    color: "#afd7e4",
    margin:
      "5px 0 18px",
  },

  error: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    background:
      "rgba(255,70,70,.15)",
    color: "#ffd0d0",
  },

  topicGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill,minmax(190px,1fr))",
    gap: 12,
  },

  topicButton: {
    padding: 16,
    textAlign: "left",
    borderRadius: 13,
    border:
      "1px solid rgba(255,255,255,.15)",
    background:
      "rgba(0,0,0,.15)",
    color: "white",
    cursor: "pointer",
    display: "grid",
    gap: 6,
  },

  topicSelected: {
    border:
      "1px solid #38d9f5",
    background:
      "rgba(6,182,212,.18)",
  },

  formHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: 15,
    alignItems:
      "flex-start",
  },

  label: {
    display: "block",
    margin:
      "17px 0 7px",
    fontWeight: 700,
    color: "#dff9ff",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    borderRadius: 10,
    border:
      "1px solid rgba(255,255,255,.18)",
    background:
      "rgba(0,0,0,.22)",
    color: "white",
    outline: "none",
    fontFamily: "inherit",
  },

  options: {
    display: "grid",
    gap: 10,
  },

  optionRow: {
    display: "flex",
    gap: 9,
    alignItems:
      "center",
    padding: 7,
    borderRadius: 11,
    background:
      "rgba(0,0,0,.16)",
    border:
      "1px solid rgba(255,255,255,.1)",
  },

  correctRow: {
    border:
      "1px solid rgba(52,211,153,.55)",
  },

  letter: {
    width: 32,
    textAlign: "center",
  },

  optionInput: {
    flex: 1,
    minWidth: 0,
    padding: 11,
    borderRadius: 8,
    border:
      "1px solid rgba(255,255,255,.12)",
    background:
      "transparent",
    color: "white",
    outline: "none",
  },

  correctButton: {
    padding:
      "9px 12px",
    borderRadius: 8,
    border:
      "1px solid rgba(255,255,255,.15)",
    background:
      "rgba(255,255,255,.06)",
    color: "white",
    cursor: "pointer",
    whiteSpace:
      "nowrap",
  },

  correct: {
    background:
      "rgba(52,211,153,.15)",
    color: "#6ee7b7",
    borderColor:
      "rgba(52,211,153,.4)",
  },

  twoColumns: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: 15,
  },

  actions: {
    display: "flex",
    justifyContent:
      "flex-end",
    gap: 10,
    marginTop: 18,
  },

  primaryButton: {
    padding:
      "12px 20px",
    border: 0,
    borderRadius: 10,
    background:
      "linear-gradient(90deg,#06b6d4,#0ea5e9)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  },

  secondaryButton: {
    padding:
      "11px 16px",
    borderRadius: 10,
    border:
      "1px solid rgba(255,255,255,.18)",
    background:
      "rgba(255,255,255,.08)",
    color: "white",
    cursor: "pointer",
  },

  filter: {
    padding: 10,
    borderRadius: 9,
    background:
      "#0b3149",
    color: "white",
    border:
      "1px solid rgba(255,255,255,.18)",
  },

  questionCard: {
    padding: 20,
    marginTop: 12,
    borderRadius: 15,
    background:
      "rgba(0,0,0,.15)",
    border:
      "1px solid rgba(255,255,255,.1)",
  },

  questionTop: {
    display: "flex",
    gap: 8,
    alignItems:
      "center",
    flexWrap: "wrap",
  },

  badge: {
    padding:
      "5px 9px",
    borderRadius: 20,
    background:
      "rgba(6,182,212,.14)",
    color: "#8cefff",
    fontSize: 12,
    fontWeight: 700,
  },

  number: {
    marginLeft: "auto",
    color: "#9ccbd7",
    fontSize: 12,
  },

  question: {
    fontSize: 17,
    lineHeight: 1.5,
  },

  savedOptions: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: 8,
  },

  savedOption: {
    padding: 10,
    borderRadius: 8,
    background:
      "rgba(255,255,255,.04)",
    color: "#cce7ee",
  },

  savedCorrect: {
    background:
      "rgba(52,211,153,.1)",
    color: "#d7fff0",
  },

  editButton: {
    padding:
      "9px 14px",
    borderRadius: 9,
    border:
      "1px solid rgba(56,189,248,.3)",
    background:
      "rgba(56,189,248,.1)",
    color: "#8edfff",
    cursor: "pointer",
  },

  deleteButton: {
    padding:
      "9px 14px",
    borderRadius: 9,
    border:
      "1px solid rgba(248,113,113,.3)",
    background:
      "rgba(248,113,113,.1)",
    color: "#ffb2b2",
    cursor: "pointer",
  },

  empty: {
    padding: 35,
    textAlign: "center",
    color: "#afd7e4",
  },
};