import React from "react";
import CheckImage from "@/assets/images/icon/ck-white.svg";

const Checkbox = ({
  id,
  disabled,
  label,
  checked, // rename from value
  name,
  onChange,
  activeClass = "bg-slate-900 ring-slate-900 dark:bg-slate-700 dark:ring-slate-700",
}) => {
  return (
    <label
      htmlFor={id}
      className={`flex items-center ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <input
        id={id}
        type="checkbox"
        className="hidden"
        name={name}
        checked={checked} // use checked here
        onChange={onChange}
        disabled={disabled}
      />

      <span
        className={`h-5 w-5 border flex-none border-slate-300 rounded 
          inline-flex mr-3 relative transition-all duration-150
          ${checked
            ? `${activeClass} ring-2 ring-offset-2 flex items-center justify-center`
            : "bg-slate-100"
          }`}
      >
        {checked && <img src={CheckImage} alt="" className="h-[10px] w-[10px]" />}
      </span>

      <span className="text-slate-600 text-sm">{label}</span>
    </label>
  );
};

export default Checkbox;
