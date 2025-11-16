import React from "react";
import Input from "../../atoms/Input/Input";
import Button from "../../atoms/Button/Button";
import "./WeightTracker.css";

const WeightTracker = ({
  exercise,
  weight,
  onWeightChange,
  onUpdateWeight,
}) => {
  return (
    <div className="weight-tracker">
      <Input
        type="number"
        value={weight}
        onChange={(e) => onWeightChange(e.target.value)}
        placeholder="Weight (lbs)"
        className="weight-input"
      />
      <Button
        variant="success"
        onClick={() => onUpdateWeight(exercise, weight)}
        disabled={!weight}
        className="update-weight-btn"
      >
        Update
      </Button>
    </div>
  );
};

export default WeightTracker;
