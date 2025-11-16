import React from "react";
import Input from "../../atoms/Input/Input";
import "./TimeTracker.css";

const TimeTracker = ({
  itemKey,
  timeValue,
  onTimeChange,
  placeholder = "HH:MM",
}) => {
  return (
    <div className="time-tracker">
      <Input
        type="text"
        value={timeValue}
        onChange={(e) => onTimeChange(itemKey, e.target.value)}
        placeholder={placeholder}
        className="time-input"
        pattern="[0-9]{1,2}:[0-9]{2}"
      />
    </div>
  );
};

export default TimeTracker;
