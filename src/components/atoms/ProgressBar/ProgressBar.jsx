import React from "react";
import "./ProgressBar.css";

const ProgressBar = ({
  value,
  max = 100,
  variant = "primary",
  size = "medium",
  showLabel = true,
  className = "",
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`progress-bar progress-bar--${size} ${className}`}>
      <div className="progress-bar__track">
        <div
          className={`progress-bar__fill progress-bar__fill--${variant}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="progress-bar__label">{Math.round(percentage)}%</div>
      )}
    </div>
  );
};

export default ProgressBar;
