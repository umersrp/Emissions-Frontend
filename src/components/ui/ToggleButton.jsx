import React from "react";

const ToggleButton = ({ label, checked, onChange, disabled }) => {
  return (
    <div className="flex items-center gap-3">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          disabled={disabled}
        />

        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none 
          peer-focus:ring-4 peer-focus:ring-primary-900 rounded-full peer
          peer-checked:after:translate-x-full peer-checked:after:border-white 
          after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
          after:bg-white after:border-gray-300 after:border after:rounded-full 
          after:h-5 after:w-5 after:transition-all
          peer-checked:bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]">
        </div>
      </label>

      {/* 👇 This displays the label */}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

export default ToggleButton;
