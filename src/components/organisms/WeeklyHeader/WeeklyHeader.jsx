import React from "react";
import Button from "../../atoms/Button/Button";
import "./WeeklyHeader.css";

const WeeklyHeader = ({ onBack, title = "📊 Weekly Breakdown" }) => {
  return (
    <header className="weekly-header">
      <Button
        variant="secondary"
        onClick={onBack}
        className="weekly-header__back-btn"
      >
        ← Back to Daily Planner
      </Button>
      <h1 className="weekly-header__title">{title}</h1>
    </header>
  );
};

export default WeeklyHeader;
