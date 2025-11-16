import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "./WeeklyBreakdown.css";

const WeeklyBreakdown = ({ onBack }) => {
  const [weeklyData, setWeeklyData] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(getThisWeekStart());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      console.error('Error calculating week start:', error);
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

  // Load weekly data from Firebase
  const loadWeeklyData = async (weekStart) => {
    setLoading(true);
    setError("");

    try {
      const weekDates = getWeekDates(weekStart);
      const weekData = {};

      // Load data for each day of the week
      for (const date of weekDates) {
        const dateStr = formatDateForFirebase(date);

        // Load daily checklist data
        const dailyChecklistsRef = collection(db, "dailyChecklists");
        const dailyQuery = query(
          dailyChecklistsRef,
          where("__name__", "==", dateStr)
        );

        // Load events data for more detailed analytics
        const eventsRef = collection(db, "checklistEvents");
        const eventsQuery = query(
          eventsRef,
          where("date", "==", dateStr),
          orderBy("timestamp", "asc")
        );

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
          if (data && typeof data === 'object') {
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
              } else if (key.includes("Time") && data[key] !== undefined && data[key] !== null && data[key] !== '') {
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

  // Navigate to previous/next week
  const navigateWeek = (direction) => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedWeek(newDate);
  };

  // Calculate week totals
  const calculateWeekTotals = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    let totalTime = 0;
    const categoryTotals = {};

    // Add null check for weeklyData
    if (!weeklyData || typeof weeklyData !== 'object') {
      return {
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        totalTime: 0,
        categoryTotals: {}
      };
    }

    Object.values(weeklyData).forEach((dayData) => {
      // Add null checks for dayData and stats
      if (!dayData || !dayData.stats) return;
      
      totalTasks += dayData.stats.totalTasks || 0;
      completedTasks += dayData.stats.completedTasks || 0;
      totalTime += dayData.stats.timeSpent || 0;

      // Add null check for categories
      if (dayData.stats.categories) {
        Object.entries(dayData.stats.categories).forEach(([category, stats]) => {
          if (!stats) return;
          
          categoryTotals[category] = categoryTotals[category] || {
            total: 0,
            completed: 0,
          };
          categoryTotals[category].total += stats.total || 0;
          categoryTotals[category].completed += stats.completed || 0;
        });
      }
    });

    return {
      totalTasks,
      completedTasks,
      completionRate:
        totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0,
      totalTime,
      categoryTotals,
    };
  };

  useEffect(() => {
    loadWeeklyData(selectedWeek);
  }, [selectedWeek]);

  const weekTotals = calculateWeekTotals();
  const weekDates = getWeekDates(selectedWeek);

  return (
    <div className="weekly-breakdown">
      {/* Header */}
      <div className="weekly-header">
        <button onClick={onBack} className="back-btn">
          ← Back to Daily Planner
        </button>
        <h1>📊 Weekly Breakdown</h1>
      </div>

      {/* Week Navigation */}
      <div className="week-navigation">
        <button onClick={() => navigateWeek(-1)} className="nav-btn">
          ← Previous Week
        </button>
        <h2>
          Week of {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
        </h2>
        <button onClick={() => navigateWeek(1)} className="nav-btn">
          Next Week →
        </button>
      </div>

      {loading && <div className="loading">Loading weekly data...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <>
          {/* Week Summary */}
          <div className="week-summary">
            <h3>📈 Week Overview</h3>
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-number">{weekTotals.totalTasks}</div>
                <div className="summary-label">Total Tasks</div>
              </div>
              <div className="summary-card">
                <div className="summary-number">
                  {weekTotals.completedTasks}
                </div>
                <div className="summary-label">Completed</div>
              </div>
              <div className="summary-card">
                <div className="summary-number">
                  {weekTotals.completionRate}%
                </div>
                <div className="summary-label">Completion Rate</div>
              </div>
              <div className="summary-card">
                <div className="summary-number">{weekTotals.totalTime}</div>
                <div className="summary-label">Minutes Spent</div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {Object.keys(weekTotals.categoryTotals).length > 0 && (
            <div className="category-breakdown">
              <h3>🎯 Category Performance</h3>
              <div className="categories-grid">
                {Object.entries(weekTotals.categoryTotals).map(
                  ([category, stats]) => {
                    const rate =
                      stats.total > 0
                        ? ((stats.completed / stats.total) * 100).toFixed(1)
                        : 0;
                    return (
                      <div
                        key={category}
                        className={`category-card ${category}`}
                      >
                        <div className="category-name">{category}</div>
                        <div className="category-stats">
                          {stats.completed}/{stats.total} ({rate}%)
                        </div>
                        <div className="category-progress">
                          <div
                            className="progress-bar"
                            style={{ width: `${rate}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Daily Breakdown */}
          <div className="daily-breakdown">
            <h3>📅 Daily Performance</h3>
            <div className="days-grid">
              {weekDates && Array.isArray(weekDates) ? weekDates.map((date, index) => {
                if (!date) return null;
                
                const dateStr = formatDateForFirebase(date);
                const dayData = weeklyData[dateStr] || {
                  stats: {
                    totalTasks: 0,
                    completedTasks: 0,
                    completionRate: 0,
                    timeSpent: 0,
                    categories: {}
                  },
                };
                
                // Ensure stats exist with defaults
                const stats = dayData.stats || {
                  totalTasks: 0,
                  completedTasks: 0,
                  completionRate: 0,
                  timeSpent: 0,
                  categories: {}
                };
                
                const isToday =
                  dateStr === new Date().toISOString().split("T")[0];

                return (
                  <div
                    key={dateStr}
                    className={`day-card ${isToday ? "today" : ""}`}
                  >
                    <div className="day-header">
                      <div className="day-name">{formatDate(date)}</div>
                      {isToday && <span className="today-badge">Today</span>}
                    </div>

                    <div className="day-stats">
                      <div className="stat-row">
                        <span className="stat-label">Tasks:</span>
                        <span className="stat-value">
                          {stats.completedTasks || 0}/
                          {stats.totalTasks || 0}
                        </span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Rate:</span>
                        <span className="stat-value">
                          {stats.completionRate || 0}%
                        </span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Time:</span>
                        <span className="stat-value">
                          {stats.timeSpent || 0}m
                        </span>
                      </div>
                    </div>

                    <div className="completion-bar">
                      <div
                        className="completion-fill"
                        style={{ width: `${stats.completionRate || 0}%` }}
                      ></div>
                    </div>

                    {/* Mini category breakdown */}
                    {stats.categories && Object.keys(stats.categories).length > 0 && (
                      <div className="day-categories">
                        {Object.entries(stats.categories)
                          .slice(0, 3)
                          .map(([category, categoryStats]) => {
                            if (!categoryStats) return null;
                            return (
                              <div
                                key={category}
                                className={`mini-category ${category}`}
                              >
                                <span className="mini-category-name">
                                  {category}
                                </span>
                                <span className="mini-category-count">
                                  {categoryStats.completed || 0}/{categoryStats.total || 0}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              }) : <div className="error">No dates available</div>}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button
              onClick={() => loadWeeklyData(selectedWeek)}
              className="refresh-btn"
            >
              🔄 Refresh Data
            </button>
            <button
              onClick={() => setSelectedWeek(getThisWeekStart())}
              className="current-week-btn"
            >
              📅 Current Week
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WeeklyBreakdown;
