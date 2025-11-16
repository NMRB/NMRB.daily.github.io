import React from "react";
import Badge from "../../atoms/Badge/Badge";
import ChecklistItem from "../../molecules/ChecklistItem/ChecklistItem";
import ExerciseDetails from "../../molecules/ExerciseDetails/ExerciseDetails";
import WeightTracker from "../../molecules/WeightTracker/WeightTracker";
import TimeTracker from "../../molecules/TimeTracker/TimeTracker";
import "./ChecklistSection.css";

const ChecklistSection = ({
  title,
  timeIndicator,
  items = [],
  checkedItems = {},
  onItemToggle,
  timeTracking = {},
  onTimeChange,
  weightInputs = {},
  onWeightChange,
  onUpdateWeight,
  showWeightTracking = false,
}) => {
  const getTimeIndicatorVariant = (timeIndicator) => {
    if (!timeIndicator) return "time";

    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const timeRanges = timeIndicator.split(" - ");
    if (timeRanges.length !== 2) return "time";

    const [startTime, endTime] = timeRanges;
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    if (
      currentTotalMinutes >= startTotalMinutes &&
      currentTotalMinutes <= endTotalMinutes
    ) {
      return "active-time";
    }

    return "time";
  };

  const renderItem = (item, index) => {
    const itemKey = item.key || item.id || `${title}-${index}`;
    const isChecked = checkedItems[itemKey] || false;

    return (
      <div key={itemKey} className="checklist-item-container">
        <ChecklistItem
          checked={isChecked}
          onToggle={() => onItemToggle(itemKey)}
        >
          <div className="item-content">
            {item.link ||
            item.reps ||
            item.sets ||
            item.weight ||
            item.duration ||
            item.category ? (
              <ExerciseDetails item={item} />
            ) : (
              <span className="simple-item-text">{item.text || item.name}</span>
            )}

            {onTimeChange && (
              <TimeTracker
                itemKey={itemKey}
                timeValue={timeTracking[itemKey] || ""}
                onTimeChange={onTimeChange}
              />
            )}

            {showWeightTracking && item.hasWeight && (
              <WeightTracker
                exercise={itemKey}
                weight={weightInputs[itemKey] || ""}
                onWeightChange={(weight) => onWeightChange(itemKey, weight)}
                onUpdateWeight={onUpdateWeight}
              />
            )}
          </div>
        </ChecklistItem>
      </div>
    );
  };

  return (
    <section
      className="checklist-section"
      id={title.toLowerCase().replace(/\s+/g, "-")}
    >
      <div className="section-header">
        <h2>{title}</h2>
        {timeIndicator && (
          <Badge variant={getTimeIndicatorVariant(timeIndicator)}>
            {timeIndicator}
          </Badge>
        )}
      </div>

      <div className="checklist-items">
        {items.map((item, index) => renderItem(item, index))}
      </div>
    </section>
  );
};

export default ChecklistSection;
