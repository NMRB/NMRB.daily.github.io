import React from "react";
import "./Button.scss";

const Button = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  size,
  type = "button",
  disabled = false,
  loading = false,
  title = "",
  ...props
}) => {
  const getButtonClasses = () => {
    let classes = `btn btn-${variant}`;

    if (size) {
      classes += ` btn-${size}`;
    }

    if (loading) {
      classes += ` btn-loading`;
    }

    if (className) {
      classes += ` ${className}`;
    }

    return classes;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={getButtonClasses()}
      disabled={disabled || loading}
      title={title}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
