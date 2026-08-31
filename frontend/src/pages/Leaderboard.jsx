import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import API from "../api/axios";

import "./Leaderboard.css";


export default function Leaderboard() {

  const navigate = useNavigate();

  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [topic, setTopic] =
    useState("All Topics");


  // =====================================================
  // LOAD LEADERBOARD
  // =====================================================

  useEffect(() => {
    loadResults();
  }, []);


  const loadResults = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await API.get("/leaderboard");

      console.log(
        "STUDENT LEADERBOARD RESPONSE:",
        response.data
      );


      const responseData =
        response.data;


      let leaderboardData = [];


      if (
        Array.isArray(responseData)
      ) {

        leaderboardData =
          responseData;

      } else if (
        Array.isArray(
          responseData?.data
        )
      ) {

        leaderboardData =
          responseData.data;

      } else if (
        Array.isArray(
          responseData?.results
        )
      ) {

        leaderboardData =
          responseData.results;

      } else if (
        Array.isArray(
          responseData?.leaderboard
        )
      ) {

        leaderboardData =
          responseData.leaderboard;

      }


      setResults(
        leaderboardData
      );


    } catch (err) {

      console.error(
        "Student leaderboard error:",
        err
      );


      setResults([]);


      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load leaderboard."
      );


    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // TOPICS
  // =====================================================

  const topics = useMemo(() => {

    const topicSet =
      new Set();


    results.forEach(
      (item) => {

        const value =
          item?.category ||
          item?.topic ||
          item?.subject ||
          "";


        if (
          String(value).trim()
        ) {

          topicSet.add(
            String(value).trim()
          );

        }

      }
    );


    return Array.from(topicSet)
      .sort(
        (a, b) =>
          a.localeCompare(b)
      );

  }, [results]);


  // =====================================================
  // FILTER + RANK
  // =====================================================

  const rankedResults =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return [...results]
        .filter(
          (item) => {

            const name =
              getStudentName(item);


            const itemTopic =
              getTopic(item);


            const matchesSearch =
              !query ||
              String(name)
                .toLowerCase()
                .includes(query) ||
              String(itemTopic)
                .toLowerCase()
                .includes(query);


            const matchesTopic =
              topic === "All Topics" ||
              String(itemTopic)
                .toLowerCase() ===
              String(topic)
                .toLowerCase();


            return (
              matchesSearch &&
              matchesTopic
            );

          }
        )
        .sort(
          (a, b) => {

            const percentageA =
              getPercentage(a);


            const percentageB =
              getPercentage(b);


            if (
              percentageA !==
              percentageB
            ) {

              return (
                percentageB -
                percentageA
              );

            }


            const scoreA =
              Number(a?.score) || 0;


            const scoreB =
              Number(b?.score) || 0;


            return (
              scoreB -
              scoreA
            );

          }
        );

    }, [
      results,
      search,
      topic,
    ]);


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {

    setSearch("");

    setTopic(
      "All Topics"
    );

  };


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <main className="student-leaderboard-page">

      {/* Background decoration */}

      <div className="leaderboard-background">

        <div className="leaderboard-orb orb-one" />

        <div className="leaderboard-orb orb-two" />

        <div className="leaderboard-grid" />

      </div>


      <div className="student-leaderboard-shell">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="student-leaderboard-header">

          <div className="leaderboard-header-left">

            <div className="student-eyebrow">

              <span className="eyebrow-line" />

              QUIZNOVA RANKINGS

            </div>


            <h1>
              Student Leaderboard
            </h1>


            <p>
              Track quiz performance and see
              how students rank across QuizNova.
            </p>

          </div>


          <div className="leaderboard-header-actions">

            <button
              type="button"
              className="leaderboard-refresh-button"
              onClick={loadResults}
              disabled={loading}
            >

              <span className="refresh-symbol">
                ↻
              </span>

              {loading
                ? "Loading..."
                : "Refresh"}

            </button>


            <button
              type="button"
              className="student-dashboard-button"
              onClick={() =>
                navigate("/dashboard")
              }
            >

              ← Dashboard

            </button>

          </div>

        </header>


        {/* =================================================
            MAIN CARD
        ================================================= */}

        <section className="student-leaderboard-card">


          {/* =================================================
              CARD HEADER
          ================================================= */}

          <div className="student-card-heading">

            <div>

              <span className="student-card-kicker">
                TOP STUDENTS
              </span>


              <h2>
                Quiz Performance
              </h2>


              <p>
                Rankings are based on quiz percentage.
              </p>

            </div>


            <div className="student-result-count">

              <strong>
                {loading
                  ? "—"
                  : rankedResults.length}
              </strong>


              <span>
                {rankedResults.length === 1
                  ? "result"
                  : "results"}
              </span>

            </div>

          </div>


          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="student-leaderboard-filters">

            <div className="student-search">

              <span className="search-icon">
                🔎
              </span>


              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search student or topic..."
              />

            </div>


            <div className="topic-select-wrapper">

              <select
                value={topic}
                onChange={(e) =>
                  setTopic(
                    e.target.value
                  )
                }
              >

                <option value="All Topics">
                  All Topics
                </option>


                {topics.map(
                  (item) => (

                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>

                  )
                )}

              </select>

            </div>


            {(search ||
              topic !== "All Topics") && (

              <button
                type="button"
                className="leaderboard-clear-button"
                onClick={clearFilters}
              >
                Clear
              </button>

            )}

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="student-leaderboard-error">

              <div className="error-icon">
                !
              </div>


              <div className="error-content">

                <strong>
                  Could not load results
                </strong>


                <p>
                  {error}
                </p>

              </div>


              <button
                type="button"
                onClick={loadResults}
              >
                Retry
              </button>

            </div>

          )}


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && !error && (

            <div className="student-leaderboard-loading">

              <div className="student-spinner" />

              <h3>
                Loading leaderboard...
              </h3>


              <p>
                Fetching the latest quiz results.
              </p>

            </div>

          )}


          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            !error &&
            rankedResults.length === 0 && (

            <div className="student-leaderboard-empty">

              <div className="student-empty-icon">
                🏆
              </div>


              <h3>
                {results.length > 0
                  ? "No matching results"
                  : "No quiz results yet"}
              </h3>


              <p>
                {results.length > 0
                  ? "Try changing your search or topic filter."
                  : "Complete a quiz and your result will appear here."}
              </p>


              {results.length > 0 && (

                <button
                  type="button"
                  className="empty-clear-button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>

              )}

            </div>

          )}


          {/* =================================================
              RESULTS
          ================================================= */}

          {!loading &&
            !error &&
            rankedResults.length > 0 && (

            <div className="student-ranking-list">


              {/* TABLE HEADER */}

              <div className="student-ranking-header">

                <span>
                  Rank
                </span>

                <span>
                  Student
                </span>

                <span>
                  Topic
                </span>

                <span>
                  Score
                </span>

                <span>
                  Percentage
                </span>

              </div>


              {/* RESULTS */}

              {rankedResults.map(
                (result, index) => {

                  const name =
                    getStudentName(
                      result
                    );


                  const itemTopic =
                    getTopic(
                      result
                    );


                  const score =
                    Number(
                      result?.score
                    ) || 0;


                  const total =
                    Number(
                      result?.totalQuestions ??
                      result?.total ??
                      0
                    );


                  const percentage =
                    getPercentage(
                      result
                    );


                  const rank =
                    index + 1;


                  const resultId =
                    result?._id ||
                    result?.id ||
                    `${name}-${itemTopic}-${index}`;


                  return (

                    <article
                      className={
                        `student-ranking-row ${
                          rank <= 3
                            ? "top-three"
                            : ""
                        }`
                      }
                      key={resultId}
                    >


                      {/* RANK */}

                      <div className="student-rank-column">

                        <div
                          className={
                            `student-rank ${
                              rank <= 3
                                ? `rank-${rank}`
                                : "rank-normal"
                            }`
                          }
                        >

                          {rank <= 3
                            ? [
                                "🥇",
                                "🥈",
                                "🥉",
                              ][rank - 1]
                            : rank}

                        </div>

                      </div>


                      {/* STUDENT */}

                      <div className="student-result-main">

                        <div className="student-avatar">

                          {getInitials(
                            name
                          )}

                        </div>


                        <div className="student-info">

                          <strong>
                            {name}
                          </strong>


                          <span>
                            Student
                          </span>

                        </div>

                      </div>


                      {/* TOPIC */}

                      <div className="student-topic-column">

                        <span className="student-topic-badge">
                          {itemTopic}
                        </span>

                      </div>


                      {/* SCORE */}

                      <div className="student-score">

                        <strong>
                          {score}
                          {total > 0
                            ? ` / ${total}`
                            : ""}
                        </strong>


                        <span>
                          Score
                        </span>

                      </div>


                      {/* PERCENTAGE */}

                      <div className="student-percentage">

                        <div className="percentage-heading">

                          <strong>
                            {formatPercentage(
                              percentage
                            )}
                          </strong>

                        </div>


                        <div className="student-progress">

                          <div
                            className="student-progress-value"
                            style={{
                              width:
                                `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    percentage
                                  )
                                )}%`,
                            }}
                          />

                        </div>

                      </div>

                    </article>

                  );

                }
              )}

            </div>

          )}

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="student-leaderboard-footer">

          <span>
            © 2026 QuizNova
          </span>


          <span>
            Student Rankings
          </span>

        </footer>

      </div>

    </main>

  );
}


/*
=====================================================
GET STUDENT NAME
=====================================================
*/

function getStudentName(result) {

  return (
    result?.username ||
    result?.studentName ||
    result?.name ||
    "Student"
  );

}


/*
=====================================================
GET TOPIC
=====================================================
*/

function getTopic(result) {

  return (
    result?.category ||
    result?.topic ||
    result?.subject ||
    "Quiz"
  );

}


/*
=====================================================
GET PERCENTAGE
=====================================================
*/

function getPercentage(result) {

  const stored =
    Number(
      result?.percentage
    );


  if (
    Number.isFinite(stored)
  ) {

    return Math.min(
      100,
      Math.max(
        0,
        stored
      )
    );

  }


  const score =
    Number(
      result?.score
    ) || 0;


  const total =
    Number(
      result?.totalQuestions ??
      result?.total ??
      0
    );


  if (total <= 0) {
    return 0;
  }


  return Math.min(
    100,
    Math.max(
      0,
      (score / total) * 100
    )
  );

}


/*
=====================================================
GET INITIALS
=====================================================
*/

function getInitials(name) {

  const parts =
    String(
      name || "Student"
    )
      .trim()
      .split(/\s+/);


  if (
    parts.length === 1
  ) {

    return parts[0]
      .slice(0, 2)
      .toUpperCase();

  }


  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();

}


/*
=====================================================
FORMAT PERCENTAGE
=====================================================
*/

function formatPercentage(value) {

  const number =
    Number(value || 0);


  if (
    Number.isInteger(number)
  ) {

    return `${number}%`;

  }


  return `${number.toFixed(1)}%`;

}