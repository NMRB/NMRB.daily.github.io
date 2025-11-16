import React from "react";
import "./Input.css";

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  className = "",
  min,
  max,
  id,
  ...props
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field"
        min={min}
        max={max}
        {...props}
      />
    </div>
  );
};

export default Input;
