import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import API from "../api/axios";

function Result() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    score = 0,
    total = 10,
    subject = "",
  } = location.state || {};

  const wrong = total - score;
  const percentage = ((score / total) * 100).toFixed(2);

  useEffect(() => {
    const saveResult = async () => {
      try {
        await API.post("/leaderboard", {
          username: localStorage.getItem("username") || "Guest",
          category: subject,
          score,
          totalQuestions: total,
          percentage: Number(percentage),
        });
      } catch (error) {
        console.log("Error saving result:", error);
      }
    };

    if (subject) {
      saveResult();
    }
  }, [score, total, subject, percentage]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#121212",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#1f1f1f",
          padding: "30px",
          borderRadius: "10px",
          width: "400px",
          textAlign: "center",
          boxShadow: "0 0 10px rgba(255,255,255,0.2)",
        }}
      >
        <h1>🎉 Quiz Completed 🎉</h1>

        <h2>{subject.toUpperCase()} Quiz</h2>

        <h3>
          Score: {score} / {total}
        </h3>

        <p>✅ Correct Answers: {score}</p>
        <p>❌ Wrong Answers: {wrong}</p>
        <p>📊 Percentage: {percentage}%</p>

        <button
          onClick={() => navigate(-1)}
          style={{
            margin: "10px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Retake Quiz
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            margin: "10px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate("/leaderboard")}
          style={{
            margin: "10px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Leaderboard
        </button>
      </div>
    </div>
  );
}

export default Result;