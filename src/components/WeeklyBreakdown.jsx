import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import WeeklyBreakdownTemplate from "./templates/WeeklyBreakdownTemplate/WeeklyBreakdownTemplate";
import "./WeeklyBreakdown.scss";

const WeeklyBreakdown = ({ onBack, initialWeekStart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [weeklyData, setWeeklyData] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(
    initialWeekStart || getThisWeekStart()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);

  // Get the start of the current week (Monday)
  function getThisWeekStart() {
    try {
      const today = new Date();
      // Validate the date
      if (isNaN(today.getTime())) {
        return new Date(); // fallback to current date
      }
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
      return weekStart;
    } catch (error) {
      console.error("Error calculating week start:", error);
      return new Date(); // fallback to current date
    }
  }

  // Generate week dates starting from Monday
  const getWeekDates = (startDate) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Format date for Firebase query (YYYY-MM-DD)
  const formatDateForFirebase = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Calculate week totals from weekly data
  const calculateWeekTotals = (weeklyData) => {
    const totals = {
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      totalTime: 0,
      categoryTotals: {},
    };

    Object.values(weeklyData).forEach((dayData) => {
      if (dayData && dayData.stats) {
        totals.totalTasks += dayData.stats.totalTasks || 0;
        totals.completedTasks += dayData.stats.completedTasks || 0;
        totals.totalTime += dayData.stats.timeSpent || 0;

        // Aggregate categories
        Object.entries(dayData.stats.categories || {}).forEach(
          ([category, data]) => {
            if (!totals.categoryTotals[category]) {
              totals.categoryTotals[category] = { total: 0, completed: 0 };
            }
            totals.categoryTotals[category].total += data.total || 0;
            totals.categoryTotals[category].completed += data.completed || 0;
          }
        );
      }
    });

    totals.completionRate =
      totals.totalTasks > 0
        ? ((totals.completedTasks / totals.totalTasks) * 100).toFixed(1)
        : 0;

    return totals;
  };

  // Load weekly data from Firebase
  const loadWeeklyData = async (weekStart) => {
    setLoading(true);
    setError("");

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("Please log in to view weekly analytics");
        setLoading(false);
        return;
      }

      const weekDates = getWeekDates(weekStart);
      const weekData = {};

      // Load data for each day of the week
      for (const date of weekDates) {
        const dateStr = formatDateForFirebase(date);

        // Load daily checklist data from user-specific collection
        const dailyChecklistsRef = collection(
          db,
          "users",
          currentUser.uid,
          "dailyChecklists"
        );
        const dailyQuery = query(
          dailyChecklistsRef,
          where("__name__", "==", dateStr)
        );

        // Load events data for more detailed analytics from user-specific collection
        const eventsRef = collection(
          db,
          "users",
          currentUser.uid,
          "checklistEvents"
        );
        const eventsQuery = query(eventsRef, where("date", "==", dateStr));

        const [dailySnapshot, eventsSnapshot] = await Promise.all([
          getDocs(dailyQuery),
          getDocs(eventsQuery),
        ]);

        const dayData = {
          date: dateStr,
          displayDate: formatDate(date),
          dailyData: null,
          events: [],
          stats: {
            totalTasks: 0,
            completedTasks: 0,
            completionRate: 0,
            timeSpent: 0,
            categories: {},
          },
        };

        // Process daily checklist data
        if (!dailySnapshot.empty) {
          dayData.dailyData = dailySnapshot.docs[0].data();

          // Calculate stats from daily data
          const data = dayData.dailyData;

          // Add null check for data
          if (data && typeof data === "object") {
            Object.keys(data).forEach((key) => {
              if (key.includes("Checklist") && Array.isArray(data[key])) {
                const checklist = data[key];
                dayData.stats.totalTasks += checklist.length || 0;
                dayData.stats.completedTasks += checklist.filter(
                  (item) => item && item.completed
                ).length;

                // Count by category
                checklist.forEach((item) => {
                  if (item && item.category) {
                    dayData.stats.categories[item.category] = dayData.stats
                      .categories[item.category] || { total: 0, completed: 0 };
                    dayData.stats.categories[item.category].total++;
                    if (item.completed) {
                      dayData.stats.categories[item.category].completed++;
                    }
                  }
                });
              } else if (
                key.includes("Time") &&
                data[key] !== undefined &&
                data[key] !== null &&
                data[key] !== ""
              ) {
                const timeValue = parseInt(data[key]);
                if (!isNaN(timeValue)) {
                  dayData.stats.timeSpent += timeValue;
                }
              }
            });
          }

          dayData.stats.completionRate =
            dayData.stats.totalTasks > 0
              ? (
                  (dayData.stats.completedTasks / dayData.stats.totalTasks) *
                  100
                ).toFixed(1)
              : 0;
        }

        // Process events data
        eventsSnapshot.docs.forEach((doc) => {
          dayData.events.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Sort events by timestamp (client-side sorting to avoid Firestore index requirement)
        dayData.events.sort((a, b) => {
          const timestampA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const timestampB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return timestampA - timestampB;
        });

        weekData[dateStr] = dayData;
      }

      setWeeklyData(weekData);
    } catch (err) {
      console.error("Error loading weekly data:", err);
      setError("Failed to load weekly data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Navigate to different weeks
  const navigateWeek = (direction) => {
    const newWeekStart = new Date(selectedWeek);
    newWeekStart.setDate(selectedWeek.getDate() + direction * 7);
    setSelectedWeek(newWeekStart);

    // Update the URL to reflect the new week
    const weekParam = newWeekStart.toISOString().split("T")[0]; // YYYY-MM-DD format
    navigate(`/weekly?week=${weekParam}`, { replace: true });
  };

  // Load data when week changes
  useEffect(() => {
    if (selectedWeek) {
      loadWeeklyData(selectedWeek);
    }
  }, [selectedWeek]);

  // Calculate current week data
  const weekDates = getWeekDates(selectedWeek);
  const weekTotals = calculateWeekTotals(weeklyData);

  return (
    <WeeklyBreakdownTemplate
      // Header props
      onBack={onBack}
      // Navigation props
      weekDates={weekDates}
      formatDate={formatDate}
      onPreviousWeek={() => navigateWeek(-1)}
      onNextWeek={() => navigateWeek(1)}
      // Data props
      weekTotals={weekTotals}
      weeklyData={weeklyData}
      // State props
      loading={loading}
      error={error}
      // Utility functions
      formatDateForFirebase={formatDateForFirebase}
      // Optional features
      selectedDay={selectedDay}
      onDaySelect={setSelectedDay}
    />
  );
};

export default WeeklyBreakdown;
