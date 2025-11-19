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
  gymWorkoutSelection,
  onRegenerateGymWorkout,
  homeWorkoutSelection,
  onRegenerateHomeWorkout,
}) => {
  return (
    <div className="daily-planner-template">
      <AppHeader
        onShowWeeklyBreakdown={onShowWeeklyBreakdown}
        onResetDay={onResetDay}
        onScrollToActive={onScrollToActive}
      />

      <main className="main-content">
        {sections.map((section, index) => {
          const isGymWorkout = section.title
            ?.toLowerCase()
            .includes("gym workout");
          const isHomeWorkout = section.title
            ?.toLowerCase()
            .includes("home workout");

          let workoutSelection = null;
          let onRegenerateWorkout = null;

          if (isGymWorkout) {
            workoutSelection = gymWorkoutSelection;
            onRegenerateWorkout = onRegenerateGymWorkout;
          } else if (isHomeWorkout) {
            workoutSelection = homeWorkoutSelection;
            onRegenerateWorkout = onRegenerateHomeWorkout;
          }

          return (
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
              workoutSelection={workoutSelection}
              onRegenerateWorkout={onRegenerateWorkout}
            />
          );
        })}
      </main>
    </div>
  );
};

export default DailyPlannerTemplate;
