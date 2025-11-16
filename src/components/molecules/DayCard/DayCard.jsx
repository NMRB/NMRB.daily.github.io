import React from "react";
import Card from "../../atoms/Card/Card";
import Badge from "../../atoms/Badge/Badge";
import ProgressBar from "../../atoms/ProgressBar/ProgressBar";
import "./DayCard.css";

const DayCard = ({ date, displayDate, stats, isToday = false, onClick }) => {
  const { totalTasks, completedTasks, completionRate, timeSpent } = stats;

  const getCompletionVariant = () => {
    const rate = parseFloat(completionRate);
    if (rate >= 80) return "success";
    if (rate >= 60) return "warning";
    return "danger";
  };

  return (
    <Card
      variant={`day ${onClick ? "interactive" : ""}`}
      className={`day-card ${isToday ? "day-card--today" : ""}`}
      onClick={onClick}
    >
      <div className="day-card__header">
        <h4 className="day-card__date">{displayDate}</h4>
        {isToday && <Badge variant="active-time">Today</Badge>}
      </div>

      <div className="day-card__stats">
        <div className="day-card__stat">
          <span className="day-card__stat-label">Tasks:</span>
          <span className="day-card__stat-value">
            {completedTasks}/{totalTasks}
          </span>
        </div>

        {timeSpent > 0 && (
          <div className="day-card__stat">
            <span className="day-card__stat-label">Time:</span>
            <span className="day-card__stat-value">{timeSpent}min</span>
          </div>
        )}
      </div>

      {totalTasks > 0 && (
        <ProgressBar
          value={completedTasks}
          max={totalTasks}
          variant={getCompletionVariant()}
          size="small"
        />
      )}
    </Card>
  );
};

export default DayCard;
