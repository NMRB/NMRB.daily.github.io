import React from "react";
import Card from "../../atoms/Card/Card";
import StatNumber from "../../atoms/StatNumber/StatNumber";
import "./SummaryCard.css";

const SummaryCard = ({ value, label, variant = "default", icon = null }) => {
  const getVariant = () => {
    if (typeof value === "string" && value.includes("%")) {
      const percentage = parseInt(value);
      if (percentage >= 80) return "success";
      if (percentage >= 60) return "warning";
      return "danger";
    }
    return variant;
  };

  return (
    <Card variant="summary" className="summary-card">
      {icon && <div className="summary-card__icon">{icon}</div>}
      <StatNumber value={value} label={label} variant={getVariant()} />
    </Card>
  );
};

export default SummaryCard;
