import React from "react";
import AppHeader from "../../organisms/AppHeader/AppHeader";
import ChecklistSection from "../../organisms/ChecklistSection/ChecklistSection";
import "./DailyPlannerTemplate.css";

const DailyPlannerTemplate = ({
  sections,
  checkedItems,
  onItemToggle,
  timeTracking,
  onTimeChange,
  weightInputs,
  onWeightChange,
  onUpdateWeight,
  onShowWeeklyBreakdown,
  onResetDay,
  onScrollToActive,
}) => {
  return (
    <div className="daily-planner-template">
      <AppHeader
        onShowWeeklyBreakdown={onShowWeeklyBreakdown}
        onResetDay={onResetDay}
        onScrollToActive={onScrollToActive}
      />

      <main className="main-content">
        {sections.map((section, index) => (
          <ChecklistSection
            key={section.title || index}
            title={section.title}
            timeIndicator={section.timeIndicator}
            items={section.items}
            checkedItems={checkedItems}
            onItemToggle={onItemToggle}
            timeTracking={timeTracking}
            onTimeChange={onTimeChange}
            weightInputs={weightInputs}
            onWeightChange={onWeightChange}
            onUpdateWeight={onUpdateWeight}
            showWeightTracking={section.showWeightTracking}
          />
        ))}
      </main>
    </div>
  );
};

export default DailyPlannerTemplate;
