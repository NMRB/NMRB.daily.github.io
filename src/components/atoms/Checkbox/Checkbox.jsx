import React from "react";
import "./Checkbox.css";

const Checkbox = ({
  id,
  checked = false,
  onChange,
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={`checkbox ${className}`}
      {...props}
    />
  );
};

export default Checkbox;
