import React from "react";
import DayCard from "../../molecules/DayCard/DayCard";
import "./DailyBreakdown.css";

const DailyBreakdown = ({
  weeklyData,
  weekDates,
  formatDateForFirebase,
  selectedDay,
  onDaySelect,
}) => {
  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="daily-breakdown">
      <h3 className="daily-breakdown__title">📅 Daily Breakdown</h3>
      <div className="daily-breakdown__grid">
        {weekDates.map((date) => {
          const dateStr = formatDateForFirebase(date);
          const dayData = weeklyData[dateStr];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDay;

          return (
            <DayCard
              key={dateStr}
              date={dateStr}
              displayDate={
                dayData?.displayDate ||
                date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              }
              stats={
                dayData?.stats || {
                  totalTasks: 0,
                  completedTasks: 0,
                  completionRate: 0,
                  timeSpent: 0,
                }
              }
              isToday={isToday}
              onClick={onDaySelect ? () => onDaySelect(dateStr) : undefined}
              className={isSelected ? "day-card--selected" : ""}
            />
          );
        })}
      </div>
    </section>
  );
};

export default DailyBreakdown;
