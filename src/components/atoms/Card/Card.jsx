import React from "react";
import "./Card.scss";

const Card = ({
  children,
  className = "",
  variant = "default",
  interactive = false,
  hover = true,
  ...props
}) => {
  const getCardClasses = () => {
    let classes = "card";

    if (variant !== "default") {
      classes += ` card--${variant}`;
    }

    if (interactive) {
      classes += ` card--interactive`;
    }

    if (className) {
      classes += ` ${className}`;
    }

    return classes;
  };

  return (
    <div className={getCardClasses()} {...props}>
      {children}
    </div>
  );
};

// Card sub-components
Card.Header = ({ children, className = "" }) => (
  <div className={`card__header ${className}`}>{children}</div>
);

Card.Title = ({ children, className = "" }) => (
  <h3 className={`card__title ${className}`}>{children}</h3>
);

Card.Subtitle = ({ children, className = "" }) => (
  <p className={`card__subtitle ${className}`}>{children}</p>
);

Card.Body = ({ children, className = "" }) => (
  <div className={`card__body ${className}`}>{children}</div>
);

Card.Footer = ({ children, className = "" }) => (
  <div className={`card__footer ${className}`}>{children}</div>
);

export default Card;
