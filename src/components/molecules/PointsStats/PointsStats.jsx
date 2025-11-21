import React from "react";
import PointsCard from "../../atoms/PointsCard/PointsCard";
import "./PointsStats.css";

const PointsStats = ({ pointsData, className = "" }) => {
  const {
    totalPoints = 0,
    dailyPoints = {},
    streaks = { current: 0, longest: 0 },
  } = pointsData;

  // Calculate today's points
  const today = new Date().toISOString().split("T")[0];
  const todaysPoints = dailyPoints[today] || 0;

  // Calculate this week's points
  const getThisWeekPoints = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek;
    const weekStart = new Date(now.setDate(diff));

    let weekTotal = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      weekTotal += dailyPoints[dateStr] || 0;
    }
    return weekTotal;
  };

  // Calculate this month's points
  const getThisMonthPoints = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    let monthTotal = 0;
    Object.entries(dailyPoints).forEach(([dateStr, points]) => {
      const date = new Date(dateStr);
      if (date.getFullYear() === year && date.getMonth() === month) {
        monthTotal += points;
      }
    });
    return monthTotal;
  };

  const thisWeekPoints = getThisWeekPoints();
  const thisMonthPoints = getThisMonthPoints();

  return (
    <div className={`points-stats ${className}`}>
      <h3 className="points-stats__title">🏆 Your Progress</h3>

      <div className="points-stats__grid">
        <PointsCard
          points={totalPoints}
          label="Total Points"
          icon="⭐"
          variant="info"
          size="large"
        />

        <PointsCard
          points={todaysPoints}
          label="Today"
          icon="📅"
          variant="success"
        />

        <PointsCard
          points={thisWeekPoints}
          label="This Week"
          icon="📊"
          variant="warning"
        />

        <PointsCard
          points={thisMonthPoints}
          label="This Month"
          icon="📈"
          variant="info"
        />

        <PointsCard
          points={streaks.current}
          label="Current Streak"
          icon="🔥"
          variant="streak"
        />

        <PointsCard
          points={streaks.longest}
          label="Longest Streak"
          icon="🏅"
          variant="success"
        />
      </div>

      {totalPoints > 0 && (
        <div className="points-stats__achievements">
          <h4 className="points-stats__subtitle">🎯 Quick Stats</h4>
          <div className="points-stats__quick-stats">
            <div className="quick-stat">
              <span className="quick-stat__label">Average per day:</span>
              <span className="quick-stat__value">
                {Object.keys(dailyPoints).length > 0
                  ? Math.round(
                      (totalPoints / Object.keys(dailyPoints).length) * 10
                    ) / 10
                  : 0}
              </span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat__label">Active days:</span>
              <span className="quick-stat__value">
                {
                  Object.values(dailyPoints).filter((points) => points > 0)
                    .length
                }
              </span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat__label">Best day:</span>
              <span className="quick-stat__value">
                {Math.max(...Object.values(dailyPoints), 0)} points
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsStats;
