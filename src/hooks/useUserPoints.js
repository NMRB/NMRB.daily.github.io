import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  saveUserPointsToFirebase,
  loadUserPointsFromFirebase,
  addPointsForTask,
} from "../firebase";

export const useUserPoints = () => {
  const { currentUser } = useAuth();

  const [pointsData, setPointsData] = useState({
    totalPoints: 0,
    dailyPoints: {},
    pointsHistory: [],
    achievements: [],
    streaks: { current: 0, longest: 0 },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load points data from Firebase
  const loadPointsData = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const result = await loadUserPointsFromFirebase(currentUser.uid);

      if (result.success) {
        setPointsData(result.data);
      } else {
        // Initialize with default data if no points found
        if (result.error === "No user points found") {
          setPointsData({
            totalPoints: 0,
            dailyPoints: {},
            pointsHistory: [],
            achievements: [],
            streaks: { current: 0, longest: 0 },
          });
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err.message);
      console.error("Error loading points data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Add points for completed task
  const addPoints = useCallback(
    async (taskData) => {
      if (!currentUser)
        return { success: false, error: "No authenticated user" };

      try {
        const result = await addPointsForTask(taskData, currentUser.uid);

        if (result.success) {
          setPointsData(result.data);
          return {
            success: true,
            pointsAdded: result.pointsAdded,
            newTotal: result.newTotal,
          };
        } else {
          setError(result.error);
          return result;
        }
      } catch (err) {
        setError(err.message);
        console.error("Error adding points:", err);
        return { success: false, error: err.message };
      }
    },
    [currentUser]
  );

  // Save points data manually (for bulk updates)
  const savePointsData = useCallback(
    async (data) => {
      if (!currentUser)
        return { success: false, error: "No authenticated user" };

      try {
        const result = await saveUserPointsToFirebase(data, currentUser.uid);

        if (result.success) {
          setPointsData(data);
          return { success: true };
        } else {
          setError(result.error);
          return result;
        }
      } catch (err) {
        setError(err.message);
        console.error("Error saving points data:", err);
        return { success: false, error: err.message };
      }
    },
    [currentUser]
  );

  // Get today's points
  const getTodaysPoints = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return pointsData.dailyPoints[today] || 0;
  }, [pointsData.dailyPoints]);

  // Get points for specific date
  const getPointsForDate = useCallback(
    (date) => {
      const dateStr =
        typeof date === "string" ? date : date.toISOString().split("T")[0];
      return pointsData.dailyPoints[dateStr] || 0;
    },
    [pointsData.dailyPoints]
  );

  // Get weekly points total
  const getWeeklyPoints = useCallback(
    (weekStart = null) => {
      const startDate =
        weekStart ||
        (() => {
          const now = new Date();
          const dayOfWeek = now.getDay();
          const diff = now.getDate() - dayOfWeek;
          return new Date(now.setDate(diff));
        })();

      let total = 0;
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        total += pointsData.dailyPoints[dateStr] || 0;
      }

      return total;
    },
    [pointsData.dailyPoints]
  );

  // Get monthly points total
  const getMonthlyPoints = useCallback(
    (month = null, year = null) => {
      const now = new Date();
      const targetMonth = month !== null ? month : now.getMonth();
      const targetYear = year !== null ? year : now.getFullYear();

      let total = 0;
      Object.entries(pointsData.dailyPoints).forEach(([dateStr, points]) => {
        const date = new Date(dateStr);
        if (
          date.getMonth() === targetMonth &&
          date.getFullYear() === targetYear
        ) {
          total += points;
        }
      });

      return total;
    },
    [pointsData.dailyPoints]
  );

  // Calculate completion rate (percentage of days with points in current month)
  const getMonthlyCompletionRate = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = now.getDate();

    let daysWithPoints = 0;
    for (let day = 1; day <= today; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      if (pointsData.dailyPoints[dateStr] > 0) {
        daysWithPoints++;
      }
    }

    return today > 0 ? Math.round((daysWithPoints / today) * 100) : 0;
  }, [pointsData.dailyPoints]);

  // Load points data when component mounts or user changes
  useEffect(() => {
    loadPointsData();
  }, [loadPointsData]);

  return {
    // Data
    pointsData,
    loading,
    error,

    // Actions
    addPoints,
    savePointsData,
    loadPointsData,

    // Getters
    getTodaysPoints,
    getPointsForDate,
    getWeeklyPoints,
    getMonthlyPoints,
    getMonthlyCompletionRate,
  };
};
