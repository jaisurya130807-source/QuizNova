import {
  useEffect,
  useRef,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./Result.css";

export default function Result() {
  const navigate = useNavigate();

  const { state } = useLocation();

  const saveStarted = useRef(false);

  const score = Number(
    state?.score ?? 0
  );

  const total = Number(
    state?.total ?? 0
  );

  const subject =
    state?.subject ||
    state?.category ||
    state?.topic ||
    "Quiz";

  const percentage =
    total > 0
      ? Math.round(
          (score / total) * 100
        )
      : 0;

  const wrong = Math.max(
    total - score,
    0
  );

  // ==========================================
  // GET REAL LOGGED-IN STUDENT NAME
  // ==========================================

  const getLoggedInUser = () => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        const user =
          JSON.parse(storedUser);

        return user;
      }
    } catch (error) {
      console.error(
        "Could not read user:",
        error
      );
    }

    return null;
  };

  // ==========================================
  // SAVE RESULT
  // ==========================================

  useEffect(() => {
    if (saveStarted.current) {
      return;
    }

    if (total <= 0) {
      console.log(
        "Result not saved because total is 0."
      );

      return;
    }

    saveStarted.current = true;

    const user =
      getLoggedInUser();

    /*
    The registered user's name comes
    directly from localStorage.user
    */

    const username =
      user?.name ||
      localStorage.getItem(
        "username"
      ) ||
      localStorage.getItem("name") ||
      "Student";

    const resultData = {
      username: String(
        username
      ).trim(),

      category: String(
        subject
      ).trim(),

      score: Number(score),

      totalQuestions: Number(
        total
      ),

      percentage: Number(
        percentage
      ),
    };

    console.log(
      "Saving leaderboard result:",
      resultData
    );

    fetch(
      "http://localhost:5000/api/leaderboard",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          ...(localStorage.getItem(
            "token"
          )
            ? {
                Authorization: `Bearer ${localStorage.getItem(
                  "token"
                )}`,
              }
            : {}),
        },

        body: JSON.stringify(
          resultData
        ),
      }
    )
      .then(async (response) => {
        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Server returned ${response.status}`
          );
        }

        return data;
      })
      .then((data) => {
        console.log(
          "Result saved successfully:",
          data
        );
      })
      .catch((error) => {
        console.error(
          "Result save failed:",
          error
        );
      });
  }, [
    subject,
    total,
    score,
    percentage,
  ]);

  return (
    <div className="result-page">
      <div className="result-shell">

        <span className="eyebrow">
          QUIZNOVA RESULT
        </span>

        <h1>
          {subject} Quiz Completed!
        </h1>

        <p className="result-sub">
          Your final score
        </p>

        <div className="result-score">
          <div>
            <b>
              {score}/{total}
            </b>

            <span>
              {percentage}%
            </span>
          </div>
        </div>

        <p className="result-message">
          {percentage >= 80
            ? "Excellent performance! Keep it up."
            : percentage >= 50
            ? "Good job! Keep practicing."
            : "Keep practicing and try again."}
        </p>

        <div className="result-stats">

          <div>
            <b>{score}</b>
            <span>Correct</span>
          </div>

          <div>
            <b>{wrong}</b>
            <span>Wrong</span>
          </div>

          <div>
            <b>{total}</b>
            <span>Total</span>
          </div>

        </div>

        <div className="result-actions">

          <button
            type="button"
            onClick={() =>
              navigate("/quiz")
            }
          >
            Try Again
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Back to Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/leaderboard")
            }
          >
            View Leaderboard
          </button>

        </div>

      </div>
    </div>
  );
}