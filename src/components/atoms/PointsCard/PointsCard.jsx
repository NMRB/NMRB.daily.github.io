import React from "react";
import "./PointsCard.css";

const PointsCard = ({
  points,
  label,
  icon = "⭐",
  variant = "default",
  size = "medium",
  className = "",
}) => {
  const baseClass = "points-card";
  const variantClass = `${baseClass}--${variant}`;
  const sizeClass = `${baseClass}--${size}`;

  return (
    <div className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}>
      <div className="points-card__icon">{icon}</div>
      <div className="points-card__content">
        <div className="points-card__points">{points}</div>
        <div className="points-card__label">{label}</div>
      </div>
    </div>
  );
};

export default PointsCard;
