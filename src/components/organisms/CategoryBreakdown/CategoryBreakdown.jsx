import React from "react";
import CategoryCard from "../../molecules/CategoryCard/CategoryCard";
import "./CategoryBreakdown.css";

const CategoryBreakdown = ({ categoryTotals }) => {
  if (!categoryTotals || Object.keys(categoryTotals).length === 0) {
    return null;
  }

  return (
    <section className="category-breakdown">
      <h3 className="category-breakdown__title">🎯 Category Performance</h3>
      <div className="category-breakdown__grid">
        {Object.entries(categoryTotals).map(([category, data]) => (
          <CategoryCard
            key={category}
            category={category}
            total={data.total}
            completed={data.completed}
          />
        ))}
      </div>
    </section>
  );
};

export default CategoryBreakdown;
