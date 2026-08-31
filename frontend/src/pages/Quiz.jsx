import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import API from "../api/axios";

import "./Quiz.css";


export default function Quiz() {

  const location =
    useLocation();

  const navigate =
    useNavigate();


  const searchParams =
    new URLSearchParams(
      location.search
    );


  const subject =
    location.state?.subject ||
    searchParams.get("subject") ||
    "Java";


  const [questions, setQuestions] =
    useState([]);

  const [answers, setAnswers] =
    useState([]);

  const [current, setCurrent] =
    useState(0);


  // Timer saved by admin
  const [
    timePerQuestion,
    setTimePerQuestion,
  ] = useState(30);

  const [
    timeLeft,
    setTimeLeft,
  ] = useState(30);


  const [
    lockedQuestions,
    setLockedQuestions,
  ] = useState(new Set());


  const [
    finished,
    setFinished,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  // Prevent multiple result submissions
  const resultSavedRef =
    useRef(false);


  // Prevent old timers
  const timerRef =
    useRef(null);


  /*
  ============================================================
  LOAD QUESTIONS + ADMIN TIMER
  ============================================================
  */

  useEffect(() => {

    let cancelled = false;


    const loadQuiz =
      async () => {

        try {

          setLoading(true);
          setError("");


          /*
          ------------------------------------------------------
          LOAD TOPIC TIMER
          ------------------------------------------------------
          */

          let adminTimer = 30;


          try {

            const topicResponse =
              await API.get(
                "/topics"
              );


            const topics =
              Array.isArray(
                topicResponse.data
              )
                ? topicResponse.data
                : topicResponse.data?.topics ||
                  [];


            const topic =
              topics.find(
                (item) =>
                  String(
                    item.name || ""
                  )
                    .trim()
                    .toLowerCase() ===
                  String(subject)
                    .trim()
                    .toLowerCase()
              );


            if (topic) {

              const possibleTimerValues = [
                topic.timePerQuestion,
                topic.timer,
                topic.timeLimit,
                topic.durationSeconds,
                topic.time,
              ];


              const foundTimer =
                possibleTimerValues.find(
                  (value) =>
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                );


              const parsedTimer =
                Number(
                  foundTimer
                );


              if (
                Number.isFinite(
                  parsedTimer
                ) &&
                parsedTimer >= 5
              ) {

                adminTimer =
                  Math.min(
                    60,
                    parsedTimer
                  );

              }

            }

          } catch (topicError) {

            console.error(
              "Could not load topic timer:",
              topicError
            );

          }


          if (cancelled) {
            return;
          }


          setTimePerQuestion(
            adminTimer
          );

          setTimeLeft(
            adminTimer
          );


          /*
          ------------------------------------------------------
          LOAD QUESTIONS
          ------------------------------------------------------
          */

          const response =
            await API.get(
              `/questions/topic/${encodeURIComponent(
                subject
              )}`
            );


          const data =
            Array.isArray(
              response.data
            )
              ? response.data
              : response.data?.questions ||
                [];


          if (cancelled) {
            return;
          }


          setQuestions(data);

          setAnswers(
            Array(
              data.length
            ).fill("")
          );

          setCurrent(0);

          setLockedQuestions(
            new Set()
          );

          setFinished(false);

          resultSavedRef.current =
            false;


        } catch (err) {

          if (cancelled) {
            return;
          }


          console.error(
            "Failed to load quiz:",
            err
          );


          setError(
            err.response?.data?.message ||
              "Failed to load questions from server."
          );


          setQuestions([]);

        } finally {

          if (!cancelled) {
            setLoading(false);
          }

        }

      };


    loadQuiz();


    return () => {

      cancelled = true;


      if (timerRef.current) {

        clearInterval(
          timerRef.current
        );

        timerRef.current =
          null;

      }

    };

  }, [subject]);


  /*
  ============================================================
  QUESTION TIMER
  ============================================================
  */

  useEffect(() => {

    if (
      loading ||
      finished ||
      questions.length === 0 ||
      lockedQuestions.has(current)
    ) {

      return;

    }


    if (timerRef.current) {

      clearInterval(
        timerRef.current
      );

      timerRef.current =
        null;

    }


    setTimeLeft(
      timePerQuestion
    );


    let remaining =
      timePerQuestion;


    timerRef.current =
      setInterval(() => {

        remaining -= 1;


        setTimeLeft(
          remaining
        );


        if (remaining <= 0) {

          clearInterval(
            timerRef.current
          );

          timerRef.current =
            null;


          handleQuestionTimeout(
            current
          );

        }

      }, 1000);


    return () => {

      if (timerRef.current) {

        clearInterval(
          timerRef.current
        );

        timerRef.current =
          null;

      }

    };

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [
    current,
    timePerQuestion,
    loading,
    finished,
    questions.length,
  ]);


  /*
  ============================================================
  TIMEOUT
  ============================================================
  */

  const handleQuestionTimeout =
    (index) => {

      setLockedQuestions(
        (previous) => {

          const next =
            new Set(
              previous
            );

          next.add(index);

          return next;

        }
      );


      if (
        index >=
        questions.length - 1
      ) {

        setFinished(true);

        return;

      }


      setCurrent(
        index + 1
      );

    };


  /*
  ============================================================
  SELECT ANSWER
  ============================================================
  */

  const handleSelect =
    (option) => {

      if (
        finished ||
        lockedQuestions.has(
          current
        )
      ) {

        return;

      }


      setAnswers(
        (previous) => {

          const next =
            [...previous];

          next[current] =
            option;

          return next;

        }
      );

    };


  /*
  ============================================================
  NEXT QUESTION
  ============================================================
  */

  const handleNext =
    () => {

      if (
        finished ||
        lockedQuestions.has(
          current
        )
      ) {

        return;

      }


      if (!answers[current]) {
        return;
      }


      if (
        current >=
        questions.length - 1
      ) {

        setFinished(true);

        return;

      }


      setCurrent(
        (previous) =>
          previous + 1
      );

    };


  /*
  ============================================================
  PREVIOUS QUESTION
  ============================================================
  */

  const handlePrevious =
    () => {

      if (current <= 0) {
        return;
      }


      let target =
        current - 1;


      while (
        target >= 0 &&
        lockedQuestions.has(
          target
        )
      ) {

        target -= 1;

      }


      if (target >= 0) {

        setCurrent(
          target
        );

      }

    };


  /*
  ============================================================
  QUESTION PALETTE
  ============================================================
  */

  const handleQuestionClick =
    (index) => {

      if (
        lockedQuestions.has(
          index
        )
      ) {

        return;

      }


      setCurrent(index);

    };


  /*
  ============================================================
  RESTART QUIZ
  ============================================================
  */

  const restartQuiz =
    () => {

      if (timerRef.current) {

        clearInterval(
          timerRef.current
        );

        timerRef.current =
          null;

      }


      // IMPORTANT:
      // Allow the new attempt to be saved.
      resultSavedRef.current =
        false;


      setCurrent(0);

      setAnswers(
        Array(
          questions.length
        ).fill("")
      );

      setLockedQuestions(
        new Set()
      );

      setFinished(false);

      setTimeLeft(
        timePerQuestion
      );

    };


  /*
  ============================================================
  SCORE
  ============================================================
  */

  const score =
    useMemo(() => {

      return answers.reduce(
        (
          total,
          answer,
          index
        ) => {

          const correctAnswer =
            questions[index]?.answer;


          return (
            answer &&
            correctAnswer &&
            answer ===
              correctAnswer
          )
            ? total + 1
            : total;

        },
        0
      );

    }, [
      answers,
      questions,
    ]);


  const percentage =
    questions.length > 0
      ? Math.round(
          (
            score /
            questions.length
          ) * 100
        )
      : 0;


  /*
  ============================================================
  SAVE RESULT TO MONGODB
  ============================================================
  */

  useEffect(() => {

    if (!finished) {
      return;
    }


    if (
      resultSavedRef.current
    ) {

      return;

    }


    if (
      questions.length === 0
    ) {

      return;

    }


    // Mark immediately so React
    // cannot create duplicate results.
    resultSavedRef.current =
      true;


    const saveResult =
      async () => {

        try {

          /*
          ----------------------------------------------------
          GET REGISTERED USER
          ----------------------------------------------------
          */

          let user = null;


          const storedUser =
            localStorage.getItem(
              "user"
            );


          try {

            user =
              storedUser
                ? JSON.parse(
                    storedUser
                  )
                : null;

          } catch {

            user = null;

          }


          /*
          ----------------------------------------------------
          REGISTERED NAME
          ----------------------------------------------------
          */

          const username =
            String(
              user?.name ||
                localStorage.getItem(
                  "username"
                ) ||
                localStorage.getItem(
                  "name"
                ) ||
                "Student"
            ).trim();


          /*
          ----------------------------------------------------
          REGISTERED EMAIL
          ----------------------------------------------------
          */

          const email =
            String(
              user?.email ||
                localStorage.getItem(
                  "email"
                ) ||
                ""
            )
              .trim()
              .toLowerCase();


          /*
          ----------------------------------------------------
          RESULT OBJECT
          ----------------------------------------------------
          */

          const resultData = {

            username,

            studentName:
              username,

            email,

            studentEmail:
              email,

            category:
              String(
                subject
              ).trim(),

            score:
              Number(score),

            totalQuestions:
              Number(
                questions.length
              ),

            percentage:
              Number(
                percentage
              ),

          };


          console.log(
            "================================"
          );

          console.log(
            "📤 SAVING QUIZ RESULT"
          );

          console.log(
            resultData
          );

          console.log(
            "================================"
          );


          /*
          ----------------------------------------------------
          SAVE TO BACKEND
          ----------------------------------------------------
          */

          const response =
            await API.post(
              "/leaderboard",
              resultData
            );


          console.log(
            "✅ RESULT SAVED SUCCESSFULLY"
          );

          console.log(
            response.data
          );


        } catch (saveError) {

          console.error(
            "❌ FAILED TO SAVE QUIZ RESULT"
          );

          console.error(
            saveError
          );


          // Allow another attempt if
          // the server request failed.
          resultSavedRef.current =
            false;

        }

      };


    saveResult();

  }, [
    finished,
    questions.length,
    score,
    percentage,
    subject,
  ]);


  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {

    return (

      <div className="quiz-page">

        <div className="result-card">

          <div className="result-icon">
            ⏳
          </div>

          <span className="quiz-label">
            QUIZNOVA QUIZ
          </span>

          <h1>
            Loading Quiz...
          </h1>

          <p>
            Loading {subject} questions...
          </p>

        </div>

      </div>

    );

  }


  /*
  ============================================================
  NO QUESTIONS
  ============================================================
  */

  if (
    error ||
    questions.length === 0
  ) {

    return (

      <div className="quiz-page">

        <div className="result-card">

          <div className="result-icon">
            📚
          </div>

          <span className="quiz-label">
            QUIZNOVA QUIZ
          </span>

          <h1>
            No Questions Found
          </h1>

          <p>
            {error ||
              `There are no questions available for ${subject}.`}
          </p>

          <button
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >
            ← Back to Dashboard
          </button>

        </div>

      </div>

    );

  }


  /*
  ============================================================
  RESULT SCREEN
  ============================================================
  */

  if (finished) {

    return (

      <div className="quiz-page">

        <div className="result-card">

          <div className="result-icon">

            {percentage >= 80
              ? "🏆"
              : percentage >= 50
              ? "👏"
              : "📚"}

          </div>


          <span className="quiz-label">
            QUIZNOVA RESULT
          </span>


          <h1>
            {subject} Quiz Completed!
          </h1>


          <p>
            Your final score
          </p>


          <div className="score">
            {score}/
            {questions.length}
          </div>


          <div className="result-percentage">
            {percentage}%
          </div>


          <p className="result-message">

            {percentage >= 80
              ? "Excellent performance! Keep it up."
              : percentage >= 50
              ? "Good attempt! Keep practicing."
              : "Keep practicing and try again!"}

          </p>


          <div className="result-buttons">

            <button
              onClick={
                restartQuiz
              }
            >
              Try Again
            </button>


            <button
              className="secondary-button"
              onClick={() =>
                navigate(
                  "/dashboard"
                )
              }
            >
              Back to Dashboard
            </button>

          </div>

        </div>

      </div>

    );

  }


  /*
  ============================================================
  CURRENT QUESTION
  ============================================================
  */

  const question =
    questions[current];


  const minutes =
    Math.floor(
      timeLeft / 60
    );


  const seconds =
    timeLeft % 60;


  const formattedTime =
    `${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(
      2,
      "0"
    )}`;


  const progress =
    (
      (current + 1) /
      questions.length
    ) * 100;


  const answeredCount =
    answers.filter(Boolean)
      .length;


  /*
  ============================================================
  QUIZ UI
  ============================================================
  */

  return (

    <div className="quiz-page">

      <div className="quiz-container">


        {/* HEADER */}

        <div className="quiz-top">

          <div>

            <span className="quiz-label">
              QUIZNOVA QUIZ
            </span>

            <h1>
              {subject}
            </h1>

          </div>


          {/* TIMER */}

          <div
            className={`quiz-timer ${
              timeLeft <= 5
                ? "timer-warning"
                : ""
            }`}
          >

            <span className="timer-icon">
              ⏱
            </span>

            <div>

              <small>
                TIME LEFT
              </small>

              <strong>
                {formattedTime}
              </strong>

            </div>

          </div>

        </div>


        {/* PROGRESS */}

        <div className="progress-info">

          <span>
            Question {current + 1} of{" "}
            {questions.length}
          </span>

          <span>
            {Math.round(
              progress
            )}
            %
          </span>

        </div>


        <div className="progress-bar">

          <div
            style={{
              width:
                `${progress}%`,
            }}
          />

        </div>


        {/* QUESTION */}

        <div className="question-card">

          <span className="question-number">
            Question {current + 1}
          </span>


          <h2>
            {question.question}
          </h2>


          {/* OPTIONS */}

          <div className="options-grid">

            {(question.options ||
              []
            ).map(
              (
                option,
                index
              ) => (

                <button
                  key={`${
                    question._id ||
                    current
                  }-${index}`}
                  type="button"
                  className={`option-button ${
                    answers[current] ===
                    option
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleSelect(
                      option
                    )
                  }
                >

                  <span className="option-letter">

                    {String.fromCharCode(
                      65 + index
                    )}

                  </span>

                  <span>
                    {option}
                  </span>

                </button>

              )
            )}

          </div>

        </div>


        {/* QUESTION PALETTE */}

        <div className="question-palette">

          {questions.map(
            (_, index) => (

              <button
                key={index}
                type="button"
                disabled={lockedQuestions.has(
                  index
                )}
                className={`palette-button
                  ${
                    index === current
                      ? "current"
                      : ""
                  }
                  ${
                    answers[index]
                      ? "answered"
                      : ""
                  }
                  ${
                    lockedQuestions.has(
                      index
                    )
                      ? "locked"
                      : ""
                  }
                `}
                onClick={() =>
                  handleQuestionClick(
                    index
                  )
                }
              >

                {lockedQuestions.has(
                  index
                )
                  ? "×"
                  : index + 1}

              </button>

            )
          )}

        </div>


        {/* LEGEND */}

        <div className="palette-legend">

          <span>
            <i className="legend-current" />
            Current
          </span>

          <span>
            <i className="legend-answered" />
            Answered
          </span>

          <span>
            <i className="legend-unanswered" />
            Unanswered
          </span>

          <span>
            <i className="legend-locked" />
            Time Expired
          </span>

        </div>


        {/* ACTIONS */}

        <div className="quiz-actions">

          <button
            type="button"
            className="back-button"
            disabled={
              current === 0
            }
            onClick={
              handlePrevious
            }
          >
            ← Previous
          </button>


          <div className="question-status">

            {answeredCount} /{" "}
            {questions.length}{" "}
            answered

          </div>


          <button
            type="button"
            className="next-button"
            disabled={
              !answers[current]
            }
            onClick={
              handleNext
            }
          >

            {current ===
            questions.length - 1
              ? "Submit Quiz ✓"
              : "Next Question →"}

          </button>

        </div>

      </div>

    </div>

  );

}