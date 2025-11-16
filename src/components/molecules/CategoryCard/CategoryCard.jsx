import React from "react";
import Card from "../../atoms/Card/Card";
import Badge from "../../atoms/Badge/Badge";
import ProgressBar from "../../atoms/ProgressBar/ProgressBar";
import "./CategoryCard.css";

const CategoryCard = ({ category, total, completed, className = "" }) => {
  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  const getProgressVariant = () => {
    if (completionRate >= 80) return "success";
    if (completionRate >= 60) return "warning";
    return "danger";
  };

  return (
    <Card variant="category" className={`category-card ${className}`}>
      <div className="category-card__header">
        <Badge variant="category" className={category.toLowerCase()}>
          {category}
        </Badge>
        <span className="category-card__stats">
          {completed}/{total}
        </span>
      </div>

      <ProgressBar
        value={completed}
        max={total}
        variant={getProgressVariant()}
        size="small"
      />
    </Card>
  );
};

export default CategoryCard;
