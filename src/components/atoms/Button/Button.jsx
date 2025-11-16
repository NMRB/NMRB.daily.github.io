import React from "react";
import "./Button.css";

const Button = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  type = "button",
  disabled = false,
  title = "",
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn btn-${variant} ${className}`}
      disabled={disabled}
      title={title}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
