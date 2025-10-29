import React, { useState, useEffect } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { components } from "react-select";

const primary500 = "#4098ab";
const primary900 = "#4097ab7a";

const customStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "40px",
    borderRadius: "8px",
    padding: "0 4px",
    fontSize: "14px",
    borderWidth: "2px",
    borderColor: state.isFocused ? "#000000" : "#d1d5db",
    boxShadow: "none",
    "&:hover": { borderColor: "#000000" },
    backgroundColor: "white",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor:
      state.isSelected
        ? "#4098ab" // keep this color for selected
        : state.isFocused && state.isHovered
        ? "#e5f4f7" // only hover color
        : "transparent",
    color: state.isSelected ? "#fff" : "#000",
    "&:hover": {
      backgroundColor: "#e5f4f7",
      color: "#000",
    },
  }),
};


const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6dacbaff"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </components.DropdownIndicator>
);

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder,
  name,
  isDisabled = false,
  allowCustomInput = false, // 👈 only when true → allow "Create" option
}) => {
  const [localOptions, setLocalOptions] = useState(options);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const handleChange = (selectedOption) => {
    onChange?.(selectedOption, { name });
  };

  const handleCreate = (inputValue) => {
    const newOption = { label: inputValue, value: inputValue };
    setLocalOptions((prev) => {
      const exists = prev.some((opt) => opt.value === inputValue);
      return exists ? prev : [...prev, newOption];
    });
    onChange?.(newOption, { name });
  };

  const filterOption = (option, rawInput) => {
    if (!rawInput) return true;
    const search = rawInput.toLowerCase();
    return (
      option.label?.toLowerCase().startsWith(search) ||
      option.value?.toLowerCase().startsWith(search)
    );
  };

  const commonProps = {
    name,
    options: localOptions,
    value,
    onChange: handleChange,
    placeholder: placeholder || "Select...",
    styles: customStyles,
    isDisabled,
    components: { DropdownIndicator },
    classNamePrefix: "custom-select",
    isClearable: true,
    filterOption,
    // menuPlacement: "auto",
    menuPlacement: "bottom",
    theme: (theme) => ({
      ...theme,
      colors: {
        ...theme.colors,
        primary25: primary500,
        primary50: primary500,
        primary75: primary900,
        primary: primary900,
      },
    }),
  };

  return allowCustomInput ? (
    <CreatableSelect {...commonProps} onCreateOption={handleCreate} />
  ) : (
    <Select {...commonProps} />
  );
};

export default CustomSelect;
