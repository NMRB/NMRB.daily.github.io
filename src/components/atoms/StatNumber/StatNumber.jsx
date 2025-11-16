import React from "react";
import "./StatNumber.css";

const StatNumber = ({ value, label, variant = "default", className = "" }) => {
  return (
    <div className={`stat-number stat-number--${variant} ${className}`}>
      <div className="stat-number__value">{value}</div>
      <div className="stat-number__label">{label}</div>
    </div>
  );
};

export default StatNumber;
