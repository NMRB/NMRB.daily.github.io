import React from "react";
import Checkbox from "../../atoms/Checkbox/Checkbox";
import "./ChecklistItem.css";

const ChecklistItem = ({ checked, onToggle, className = "", children }) => {
  return (
    <div
      className={`checklist-item ${checked ? "completed" : ""} ${className}`}
    >
      <Checkbox checked={checked} onChange={onToggle} />
      <div className="item-content">{children}</div>
    </div>
  );
};

export default ChecklistItem;
