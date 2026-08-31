import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import API from "../api/axios";

import "./AdminLeaderboard.css";


export default function AdminLeaderboard() {

  const [results, setResults] =
    useState([]);


  const [stats, setStats] =
    useState({

      totalAttempts: 0,

      totalStudents: 0,

      averageScore: 0,

      highestScore: 0,

    });


  const [searchTerm, setSearchTerm] =
    useState("");


  const [
    selectedTopic,
    setSelectedTopic,
  ] = useState(
    "All Topics"
  );


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  /*
  =====================================================
  GET PERCENTAGE
  =====================================================
  */

  const getPercentage =
    (result) => {

      const percentage =
        Number(
          result?.percentage
        );


      if (
        Number.isFinite(
          percentage
        )
      ) {

        return Math.min(
          100,
          Math.max(
            0,
            percentage
          )
        );

      }


      const score =
        Number(
          result?.score
        ) || 0;


      const total =
        Number(
          result?.totalQuestions
        ) || 0;


      if (total > 0) {

        return (
          score /
          total
        ) * 100;

      }


      return 0;

    };


  /*
  =====================================================
  GET STUDENT NAME
  =====================================================
  */

  const getStudentName =
    (result) => {

      return (
        result?.username ||
        result?.studentName ||
        result?.name ||
        "Student"
      );

    };


  /*
  =====================================================
  GET STUDENT EMAIL
  =====================================================
  */

  const getStudentEmail =
    (result) => {

      return (
        result?.email ||
        result?.studentEmail ||
        "Email not available"
      );

    };


  /*
  =====================================================
  CALCULATE STATS
  =====================================================
  */

  const calculateStats =
    (data) => {

      const totalAttempts =
        data.length;


      const students =
        new Set();


      data.forEach(
        (result) => {

          const userId =
            result?.userId;


          const email =
            getStudentEmail(
              result
            );


          const name =
            getStudentName(
              result
            );


          const uniqueKey =
            userId
              ? String(
                  userId
                )
              : email !==
                  "Email not available"
              ? email
                  .trim()
                  .toLowerCase()
              : name
                  .trim()
                  .toLowerCase();


          students.add(
            uniqueKey
          );

        }
      );


      const percentages =
        data.map(
          getPercentage
        );


      const averageScore =
        percentages.length > 0
          ? percentages.reduce(
              (
                sum,
                value
              ) =>
                sum + value,
              0
            ) /
            percentages.length
          : 0;


      const highestScore =
        percentages.length > 0
          ? Math.max(
              ...percentages
            )
          : 0;


      setStats({

        totalAttempts,

        totalStudents:
          students.size,

        averageScore,

        highestScore,

      });

    };


  /*
  =====================================================
  LOAD LEADERBOARD
  =====================================================
  */

  const loadLeaderboard =
    async () => {

      try {

        setLoading(true);

        setError("");


        const response =
          await API.get(
            "/leaderboard"
          );


        const responseData =
          response.data;


        let leaderboardData =
          [];


        if (
          Array.isArray(
            responseData
          )
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


        if (
          responseData?.stats
        ) {

          setStats({

            totalAttempts:
              Number(
                responseData.stats
                  .totalAttempts
              ) ||
              leaderboardData.length,

            totalStudents:
              Number(
                responseData.stats
                  .totalStudents
              ) || 0,

            averageScore:
              Number(
                responseData.stats
                  .averageScore
              ) || 0,

            highestScore:
              Number(
                responseData.stats
                  .highestScore
              ) || 0,

          });

        } else {

          calculateStats(
            leaderboardData
          );

        }


      } catch (err) {

        console.error(
          "❌ Leaderboard loading error:",
          err
        );


        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load leaderboard results."
        );


        setResults([]);


        setStats({

          totalAttempts: 0,

          totalStudents: 0,

          averageScore: 0,

          highestScore: 0,

        });

      } finally {

        setLoading(false);

      }

    };


  /*
  =====================================================
  INITIAL LOAD
  =====================================================
  */

  useEffect(() => {

    loadLeaderboard();

  }, []);


  /*
  =====================================================
  TOPICS
  =====================================================
  */

  const topics =
    useMemo(() => {

      const topicSet =
        new Set();


      results.forEach(
        (result) => {

          const topic =
            result?.category ||
            result?.topic ||
            result?.subject ||
            "";


          if (
            String(
              topic
            ).trim()
          ) {

            topicSet.add(
              String(
                topic
              ).trim()
            );

          }

        }
      );


      return Array.from(
        topicSet
      ).sort(
        (a, b) =>
          a.localeCompare(b)
      );

    }, [
      results,
    ]);


  /*
  =====================================================
  FILTER RESULTS
  =====================================================
  */

  const filteredResults =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();


      return [...results]

        .filter(
          (result) => {

            const student =
              getStudentName(
                result
              );


            const email =
              getStudentEmail(
                result
              );


            const topic =
              result?.category ||
              result?.topic ||
              result?.subject ||
              "Unknown";


            const matchesSearch =
              !search ||
              String(
                student
              )
                .toLowerCase()
                .includes(
                  search
                ) ||
              String(
                email
              )
                .toLowerCase()
                .includes(
                  search
                ) ||
              String(
                topic
              )
                .toLowerCase()
                .includes(
                  search
                );


            const matchesTopic =
              selectedTopic ===
                "All Topics" ||
              String(
                topic
              )
                .toLowerCase() ===
              selectedTopic
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


            return (
              (
                Number(
                  b.score
                ) || 0
              ) -
              (
                Number(
                  a.score
                ) || 0
              )
            );

          }
        );

    }, [
      results,
      searchTerm,
      selectedTopic,
    ]);


  /*
  =====================================================
  CLEAR FILTERS
  =====================================================
  */

  const clearFilters =
    () => {

      setSearchTerm("");

      setSelectedTopic(
        "All Topics"
      );

    };


  /*
  =====================================================
  DELETE RESULT
  =====================================================
  */

  const deleteResult =
    async (result) => {

      const id =
        result?._id ||
        result?.id;


      if (!id) {

        alert(
          "This result has no ID and cannot be deleted."
        );

        return;

      }


      const student =
        getStudentName(
          result
        );


      const confirmed =
        window.confirm(
          `Delete the quiz result for ${student}?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setLoading(true);


        await API.delete(
          `/leaderboard/${id}`
        );


        alert(
          "Quiz result deleted successfully."
        );


        await loadLeaderboard();


      } catch (err) {

        console.error(
          "❌ Delete result error:",
          err
        );


        setLoading(false);


        alert(
          err.response?.data?.message ||
            "Unable to delete this result."
        );

      }

    };


  /*
  =====================================================
  FORMAT DATE
  =====================================================
  */

  const formatDate =
    (date) => {

      if (!date) {
        return "—";
      }


      const parsedDate =
        new Date(date);


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


  /*
  =====================================================
  INITIAL
  =====================================================
  */

  const getInitial =
    (name) => {

      if (!name) {
        return "?";
      }


      return String(
        name
      )
        .trim()
        .charAt(0)
        .toUpperCase();

    };


  /*
  =====================================================
  RENDER
  =====================================================
  */

  return (

    <div className="admin-leaderboard-page">


      {/* HEADER */}

      <section className="admin-leaderboard-header">

        <div>

          <span className="admin-section-label">
            PERFORMANCE RANKINGS
          </span>


          <h1>
            Student Leaderboard
          </h1>


          <p>
            View and manage every
            student quiz result.
          </p>

        </div>


        <button
          className="admin-leaderboard-refresh"
          onClick={
            loadLeaderboard
          }
          disabled={
            loading
          }
        >

          {loading
            ? "Loading..."
            : "↻ Refresh"}

        </button>

      </section>


      {/* STATISTICS */}

      <section className="admin-leaderboard-stats">


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🏆
          </div>


          <div className="admin-stat-content">

            <span className="admin-stat-label">
              Total Attempts
            </span>


            <strong>
              {loading
                ? "..."
                : stats.totalAttempts}
            </strong>


            <small>
              Completed quiz attempts
            </small>

          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            👥
          </div>


          <div className="admin-stat-content">

            <span className="admin-stat-label">
              Students
            </span>


            <strong>
              {loading
                ? "..."
                : stats.totalStudents}
            </strong>


            <small>
              Students with results
            </small>

          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            📊
          </div>


          <div className="admin-stat-content">

            <span className="admin-stat-label">
              Average Score
            </span>


            <strong>

              {loading
                ? "..."
                : `${Number(
                    stats.averageScore
                  ).toFixed(0)}%`}

            </strong>


            <small>
              Average across attempts
            </small>

          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ⭐
          </div>


          <div className="admin-stat-content">

            <span className="admin-stat-label">
              Highest Score
            </span>


            <strong>

              {loading
                ? "..."
                : `${Number(
                    stats.highestScore
                  ).toFixed(0)}%`}

            </strong>


            <small>
              Best recorded performance
            </small>

          </div>

        </div>

      </section>


      {/* RESULTS */}

      <section className="admin-ranking-card">


        <div className="admin-ranking-header">

          <div>

            <span className="ranking-kicker">
              ALL RESULTS
            </span>


            <h2>
              Student Results
            </h2>


            <p>
              Every saved quiz attempt
              is displayed below.
            </p>

          </div>


          <div className="ranking-result-count">

            <strong>
              {
                filteredResults.length
              }
            </strong>

            <span>
              results
            </span>

          </div>

        </div>


        {/* ERROR */}

        {error && (

          <div className="admin-leaderboard-error">

            <strong>
              Unable to load results
            </strong>


            <span>
              {error}
            </span>


            <button
              onClick={
                loadLeaderboard
              }
            >
              Try Again
            </button>

          </div>

        )}


        {/* FILTERS */}

        {!error && (

          <div className="admin-leaderboard-filters">


            <div className="admin-search-box">

              <span>
                🔎
              </span>


              <input
                type="text"
                placeholder="Search name, email or topic..."
                value={
                  searchTerm
                }
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />

            </div>


            <select
              className="admin-topic-filter"
              value={
                selectedTopic
              }
              onChange={(e) =>
                setSelectedTopic(
                  e.target.value
                )
              }
            >

              <option value="All Topics">
                All Topics
              </option>


              {topics.map(
                (topic) => (

                  <option
                    key={topic}
                    value={topic}
                  >
                    {topic}
                  </option>

                )
              )}

            </select>


            {(searchTerm ||
              selectedTopic !==
                "All Topics") && (

              <button
                className="admin-clear-filter"
                onClick={
                  clearFilters
                }
              >
                Clear
              </button>

            )}

          </div>

        )}


        {/* LOADING */}

        {loading && (

          <div className="admin-leaderboard-loading">

            <div className="admin-loading-spinner" />

            <h3>
              Loading student results...
            </h3>

            <p>
              Connecting to the
              leaderboard database.
            </p>

          </div>

        )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredResults.length ===
            0 && (

            <div className="admin-leaderboard-empty">

              <div className="admin-empty-icon">
                🏆
              </div>


              <h3>

                {results.length ===
                0
                  ? "No quiz results yet"
                  : "No matching results"}

              </h3>


              <p>

                {results.length ===
                0
                  ? "Complete a quiz and the result will appear here."
                  : "Try changing your search or topic filter."}

              </p>


              {results.length >
                0 && (

                <button
                  className="admin-empty-clear"
                  onClick={
                    clearFilters
                  }
                >
                  Clear Filters
                </button>

              )}

            </div>

          )}


        {/* RESULTS TABLE */}

        {!loading &&
          !error &&
          filteredResults.length >
            0 && (

            <div className="admin-ranking-table">


              {/* TABLE HEADER */}

              <div className="admin-ranking-table-head">

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

                <span>
                  Date
                </span>

                <span>
                  Action
                </span>

              </div>


              {/* RESULTS */}

              {filteredResults.map(
                (
                  result,
                  index
                ) => {

                  const student =
                    getStudentName(
                      result
                    );


                  const email =
                    getStudentEmail(
                      result
                    );


                  const topic =
                    result?.category ||
                    result?.topic ||
                    result?.subject ||
                    "Unknown";


                  const score =
                    Number(
                      result?.score
                    ) || 0;


                  const total =
                    Number(
                      result?.totalQuestions
                    ) || 0;


                  const percentage =
                    getPercentage(
                      result
                    );


                  const resultId =
                    result?._id ||
                    result?.id ||
                    `${student}-${index}`;


                  return (

                    <div
                      className="admin-ranking-row"
                      key={
                        resultId
                      }
                    >


                      {/* RANK */}

                      <div className="admin-ranking-rank">

                        {index < 3 ? (

                          <span
                            className={`rank-medal rank-${
                              index + 1
                            }`}
                          >

                            {index ===
                            0
                              ? "🥇"
                              : index ===
                                1
                              ? "🥈"
                              : "🥉"}

                          </span>

                        ) : (

                          <span className="rank-number">
                            {index + 1}
                          </span>

                        )}

                      </div>


                      {/* STUDENT */}

                      <div className="admin-ranking-student">

                        <div className="admin-student-avatar">
                          {getInitial(
                            student
                          )}
                        </div>


                        <div>

                          <strong>
                            {student}
                          </strong>


                          <small>
                            {email}
                          </small>

                        </div>

                      </div>


                      {/* TOPIC */}

                      <div className="admin-ranking-topic">

                        <span className="topic-badge">
                          {topic}
                        </span>

                      </div>


                      {/* SCORE */}

                      <div className="admin-ranking-score">

                        <strong>
                          {score} / {total}
                        </strong>


                        <small>
                          Correct answers
                        </small>

                      </div>


                      {/* PERCENTAGE */}

                      <div className="admin-ranking-percentage">

                        <div className="percentage-top">

                          <strong>
                            {Number(
                              percentage
                            ).toFixed(0)}
                            %
                          </strong>

                        </div>


                        <div className="admin-progress">

                          <div
                            className="admin-progress-value"
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


                      {/* DATE */}

                      <div className="admin-ranking-date">

                        {formatDate(
                          result?.createdAt
                        )}

                      </div>


                      {/* DELETE */}

                      <div className="admin-ranking-action">

                        <button
                          type="button"
                          className="admin-delete-button"
                          onClick={() =>
                            deleteResult(
                              result
                            )
                          }
                        >
                          🗑 Delete
                        </button>

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          )}

      </section>

    </div>

  );

}