import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DailyPlannerContainer from "./containers/DailyPlannerContainer";
import WeeklyAnalyticsPage from "./pages/WeeklyAnalyticsPage";
import ChecklistSettingsPage from "./pages/ChecklistSettingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router basename="/NMRB.daily.github.io">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DailyPlannerContainer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weekly"
            element={
              <ProtectedRoute>
                <WeeklyAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weekly/:date"
            element={
              <ProtectedRoute>
                <WeeklyAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ChecklistSettingsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
