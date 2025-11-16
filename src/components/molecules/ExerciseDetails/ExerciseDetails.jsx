import React from "react";
import Badge from "../../atoms/Badge/Badge";
import Button from "../../atoms/Button/Button";
import "./ExerciseDetails.css";

const ExerciseDetails = ({ item }) => {
  return (
    <div className="exercise-details">
      <div className="exercise-header">
        <div className="exercise-title">
          <span className="exercise-name">{item.name || item.text}</span>
          {item.category && (
            <Badge variant="category" className={item.category}>
              {item.category}
            </Badge>
          )}
        </div>
        {item.link && (
          <Button
            variant="secondary"
            className="exercise-link"
            onClick={() =>
              window.open(item.link, "_blank", "noopener,noreferrer")
            }
          >
            📹 Demo
          </Button>
        )}
      </div>

      {(item.reps || item.sets || item.weight || item.duration) && (
        <div className="exercise-specs">
          {item.duration && <span className="spec duration">⏱️ {item.duration}</span>}
          {item.weight && (
            <span className="spec weight">Weight: {item.weight}</span>
          )}
          {item.reps && <span className="spec reps">Reps: {item.reps}</span>}
          {item.sets && <span className="spec sets">Sets: {item.sets}</span>}
        </div>
      )}
    </div>
  );
};

export default ExerciseDetails;
