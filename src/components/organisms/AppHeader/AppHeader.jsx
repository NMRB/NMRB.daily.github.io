import React from "react";
import Button from "../../atoms/Button/Button";
import "./AppHeader.css";

const AppHeader = ({ onShowWeeklyBreakdown, onResetDay, onScrollToActive }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">Daily Planner</h1>
        <div className="header-controls">
          <Button
            variant="secondary"
            onClick={onScrollToActive}
            className="scroll-btn"
          >
            📍 Go to Current Time
          </Button>
          <Button
            variant="primary"
            onClick={onShowWeeklyBreakdown}
            className="analytics-btn"
          >
            📊 Weekly Analytics
          </Button>
          <Button variant="warning" onClick={onResetDay} className="reset-btn">
            🔄 Reset Day
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
