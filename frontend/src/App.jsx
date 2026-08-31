import React from "react";

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Student pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import Leaderboard from "./pages/Leaderboard";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard";
import Students from "./pages/Students";
import Topics from "./pages/Topics";
import Questions from "./pages/Questions";
import AdminLeaderboard from "./pages/AdminLeaderboard";

// Admin layout
import AdminLayout from "./components/AdminLayout";

// GLOBAL PROFESSIONAL POPUP
import { PopupProvider } from "./components/ProfessionalPopup";

import "./App.css";

function App() {
  return (
    <PopupProvider>
      <Routes>

        {/* =====================================================
            DEFAULT
        ===================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* =====================================================
            STUDENT
        ===================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/quiz"
          element={<Quiz />}
        />

        <Route
          path="/result"
          element={<Result />}
        />

        <Route
          path="/leaderboard"
          element={<Leaderboard />}
        />

        {/* =====================================================
            ADMIN
        ===================================================== */}

        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          {/* Admin Dashboard */}

          <Route
            index
            element={<AdminDashboard />}
          />

          {/* Students */}

          <Route
            path="students"
            element={<Students />}
          />

          {/* Topics */}

          <Route
            path="topics"
            element={<Topics />}
          />

          {/* Questions */}

          <Route
            path="questions"
            element={<Questions />}
          />

          {/* Admin Leaderboard */}

          <Route
            path="leaderboard"
            element={<AdminLeaderboard />}
          />
        </Route>

        {/* =====================================================
            FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </PopupProvider>
  );
}

export default App;