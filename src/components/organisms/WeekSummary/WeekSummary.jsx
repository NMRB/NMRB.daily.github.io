import React from "react";
import SummaryCard from "../../molecules/SummaryCard/SummaryCard";
import "./WeekSummary.css";

const WeekSummary = ({ weekTotals }) => {
  const { totalTasks, completedTasks, completionRate, totalTime } = weekTotals;

  return (
    <section className="week-summary">
      <h3 className="week-summary__title">📈 Week Overview</h3>
      <div className="week-summary__grid">
        <SummaryCard value={totalTasks} label="Total Tasks" icon="📋" />
        <SummaryCard
          value={completedTasks}
          label="Completed"
          variant="success"
          icon="✅"
        />
        <SummaryCard
          value={`${completionRate}%`}
          label="Completion Rate"
          icon="🎯"
        />
        <SummaryCard
          value={totalTime}
          label="Minutes Spent"
          variant="primary"
          icon="⏱️"
        />
      </div>
    </section>
  );
};

export default WeekSummary;
