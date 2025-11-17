import React from "react";
import { useNavigate } from "react-router-dom";
import NavigationHeader from "../components/organisms/NavigationHeader/NavigationHeader";
import DailyPlannerTemplate from "../components/templates/DailyPlannerTemplate/DailyPlannerTemplate";

const DailyPlannerPage = ({
  sections,
  checkedItems,
  onItemToggle,
  timeTracking,
  onTimeChange,
  weightInputs,
  onWeightChange,
  onUpdateWeight,
  onResetDay,
  onScrollToActive,
  gymWorkoutSelection,
  onRegenerateGymWorkout,
  homeWorkoutSelection,
  onRegenerateHomeWorkout,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <NavigationHeader />
      <DailyPlannerTemplate
        sections={sections}
        checkedItems={checkedItems}
        onItemToggle={onItemToggle}
        timeTracking={timeTracking}
        onTimeChange={onTimeChange}
        weightInputs={weightInputs}
        onWeightChange={onWeightChange}
        onUpdateWeight={onUpdateWeight}
        onShowWeeklyBreakdown={() => navigate("/weekly")}
        onResetDay={onResetDay}
        onScrollToActive={onScrollToActive}
        gymWorkoutSelection={gymWorkoutSelection}
        onRegenerateGymWorkout={onRegenerateGymWorkout}
        homeWorkoutSelection={homeWorkoutSelection}
        onRegenerateHomeWorkout={onRegenerateHomeWorkout}
      />
    </>
  );
};

export default DailyPlannerPage;
