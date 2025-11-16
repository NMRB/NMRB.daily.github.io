import React from "react";
import WeeklyHeader from "../../organisms/WeeklyHeader/WeeklyHeader";
import WeekNavigation from "../../organisms/WeekNavigation/WeekNavigation";
import WeekSummary from "../../organisms/WeekSummary/WeekSummary";
import CategoryBreakdown from "../../organisms/CategoryBreakdown/CategoryBreakdown";
import DailyBreakdown from "../../organisms/DailyBreakdown/DailyBreakdown";
import "./WeeklyBreakdownTemplate.css";

const WeeklyBreakdownTemplate = ({
  // Header props
  onBack,

  // Navigation props
  weekDates,
  formatDate,
  onPreviousWeek,
  onNextWeek,

  // Data props
  weekTotals,
  weeklyData,

  // State props
  loading,
  error,

  // Utility functions
  formatDateForFirebase,

  // Optional features
  selectedDay,
  onDaySelect,
}) => {
  return (
    <div className="weekly-breakdown-template">
      <WeeklyHeader onBack={onBack} />

      <main className="weekly-breakdown-template__content">
        <WeekNavigation
          weekDates={weekDates}
          formatDate={formatDate}
          onPrevious={onPreviousWeek}
          onNext={onNextWeek}
        />

        {loading && (
          <div className="weekly-breakdown-template__loading">
            <div className="loading-spinner"></div>
            <p>Loading weekly data...</p>
          </div>
        )}

        {error && (
          <div className="weekly-breakdown-template__error">
            <p>⚠️ {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <WeekSummary weekTotals={weekTotals} />

            <CategoryBreakdown categoryTotals={weekTotals.categoryTotals} />

            <DailyBreakdown
              weeklyData={weeklyData}
              weekDates={weekDates}
              formatDateForFirebase={formatDateForFirebase}
              selectedDay={selectedDay}
              onDaySelect={onDaySelect}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default WeeklyBreakdownTemplate;
