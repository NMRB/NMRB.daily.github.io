import React from "react";
import Button from "../../atoms/Button/Button";
import "./WeekNavigation.css";

const WeekNavigation = ({ weekDates, onPrevious, onNext, formatDate }) => {
  return (
    <nav className="week-navigation">
      <Button
        variant="secondary"
        onClick={onPrevious}
        className="week-navigation__btn"
      >
        ← Previous Week
      </Button>

      <h2 className="week-navigation__title">
        Week of {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
      </h2>

      <Button
        variant="secondary"
        onClick={onNext}
        className="week-navigation__btn"
      >
        Next Week →
      </Button>
    </nav>
  );
};

export default WeekNavigation;
