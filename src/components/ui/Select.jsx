// import React, { useState, useEffect } from "react";
// import Select from "react-select";
// import CreatableSelect from "react-select/creatable";
// import { components } from "react-select";

// const primary500 = "#4098ab";
// const primary900 = "#4097ab7a";

// // 🔠 Capitalize first letter helper
// const capitalizeLabel = (text) => {
//   if (!text || typeof text !== "string") return text;
//   return text.charAt(0).toUpperCase() + text.slice(1);
// };

// const customStyles = {
//   control: (base, state) => ({
//     ...base,
//     minHeight: "40px",
//     borderRadius: "8px",
//     padding: "0 4px",
//     fontSize: "14px",
//     borderWidth: "2px",
//     borderColor: state.isDisabled
//       ? "#e5e7eb"
//       : state.isFocused
//         ? "#000000"
//         : "#d1d5db",
//     boxShadow: "none",
//     backgroundColor: state.isDisabled ? "#f3f4f6" : "white",
//     color: state.isDisabled ? "#9ca3af" : "#000",
//     cursor: state.isDisabled ? "not-allowed" : "default",
//     "&:hover": {
//       borderColor: state.isDisabled ? "#e5e7eb" : "#000000",
//     },
//   }),
//   menu: (base) => ({
//     ...base,
//     zIndex: 9999,
//   }),
//   option: (base, state) => ({
//     ...base,
//     backgroundColor: state.isSelected
//       ? "#4098ab"
//       : state.isFocused && state.isHovered
//         ? "#e5f4f7"
//         : "transparent",
//     color: state.isSelected ? "#fff" : "#000",
//     "&:hover": {
//       backgroundColor: "#e5f4f7",
//       color: "#000",
//     },
//   }),
//   singleValue: (base, state) => ({
//     ...base,
//     color: state.isDisabled ? "#000000" : "#000",

//     whiteSpace: "normal",
//     overflow: "visible",
//     textOverflow: "unset",
//     display: "block",
//     lineHeight: "1.4",
//   }),
//   placeholder: (base, state) => ({
//     ...base,
//     color: state.isDisabled ? "#9ca3af" : "#6b7280",
//   }),
// };

// // ▼ Custom dropdown arrow
// const DropdownIndicator = (props) => {
//   const color = props.selectProps.isDisabled ? "#9ca3af" : "#6dacbaff";
//   return (
//     <components.DropdownIndicator {...props}>
//       <svg
//         width="16"
//         height="16"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke={color}
//         strokeWidth="4"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       >
//         <polyline points="6 9 12 15 18 9" />
//       </svg>
//     </components.DropdownIndicator>
//   );
// };

// const CustomSelect = ({
//   options = [],
//   value,
//   onChange,
//   placeholder,
//   name,
//   isDisabled = false,
//   allowCustomInput = false,
// }) => {
//   const [localOptions, setLocalOptions] = useState([]);

//   // 🔠 Capitalize all incoming options
//   useEffect(() => {
//     const formatted = options.map((opt) => ({
//       ...opt,
//       label: capitalizeLabel(opt.label),
//     }));
//     setLocalOptions(formatted);
//   }, [options]);

//   const handleChange = (selectedOption) => {
//     onChange?.(selectedOption, { name });
//   };

//   // 🔠 Capitalize new created items
//   const handleCreate = (inputValue) => {
//     const formatted = capitalizeLabel(inputValue);
//     const newOption = { label: formatted, value: formatted };

//     setLocalOptions((prev) => {
//       const exists = prev.some((opt) => opt.value === formatted);
//       return exists ? prev : [...prev, newOption];
//     });

//     onChange?.(newOption, { name });
//   };

//   const filterOption = (option, rawInput) => {
//     if (!rawInput) return true;
//     const search = rawInput.toLowerCase();

//     const label =
//       typeof option.label === "string"
//         ? option.label.toLowerCase()
//         : option.label?.toString().toLowerCase() || "";

//     const value =
//       typeof option.value === "string"
//         ? option.value.toLowerCase()
//         : option.value?.toString?.().toLowerCase?.() || "";

//     return label.startsWith(search) || value.startsWith(search);
//   };

//   const commonProps = {
//     name,
//     options: localOptions,
//     value,
//     onChange: handleChange,
//     placeholder: placeholder || "Select...",
//     styles: customStyles,
//     isDisabled,
//     components: { DropdownIndicator },
//     classNamePrefix: "custom-select",
//     isClearable: true,
//     filterOption,
//     menuPlacement: "bottom",
//     theme: (theme) => ({
//       ...theme,
//       colors: {
//         ...theme.colors,
//         primary25: primary500,
//         primary50: primary500,
//         primary75: primary900,
//         primary: primary900,
//       },
//     }),
//   };

//   return allowCustomInput ? (
//     <CreatableSelect {...commonProps} onCreateOption={handleCreate} />
//   ) : (
//     <Select {...commonProps} />
//   );
// };

// export default CustomSelect;
import React, { useState, useEffect } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { components } from "react-select";

const primary500 = "#4098ab";
const primary900 = "#4097ab7a";

// 🔠 Capitalize helper
const capitalizeLabel = (text) => {
  if (!text || typeof text !== "string") return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const customStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "40px",
    borderRadius: "8px",
    padding: "0 4px",
    fontSize: "14px",
    borderWidth: "2px",
    borderColor: state.isDisabled
      ? "#e5e7eb"
      : state.isFocused
      ? "#000000"
      : "#d1d5db",
    boxShadow: "none",
    backgroundColor: state.isDisabled ? "#f3f4f6" : "white",
    color: state.isDisabled ? "#9ca3af" : "#000",
    cursor: state.isDisabled ? "not-allowed" : "default",
    "&:hover": {
      borderColor: state.isDisabled ? "#e5e7eb" : "#000000",
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#4098ab"
      : state.isFocused
      ? "#e5f4f7"
      : "transparent",
    color: state.isSelected ? "#fff" : "#000",
    "&:hover": {
      backgroundColor: "#e5f4f7",
      color: "#000",
    },
  }),
  singleValue: (base, state) => ({
    ...base,
    color: state.isDisabled ? "#000000" : "#000",
    whiteSpace: "normal",
    overflow: "visible",
    textOverflow: "unset",
    display: "block",
    lineHeight: "1.4",
  }),
  placeholder: (base, state) => ({
    ...base,
    color: state.isDisabled ? "#9ca3af" : "#6b7280",
  }),
};

// ▼ Custom arrow
const DropdownIndicator = (props) => {
  const color = props.selectProps.isDisabled ? "#9ca3af" : "#6dacbaff";
  return (
    <components.DropdownIndicator {...props}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </components.DropdownIndicator>
  );
};

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder,
  name,
  isDisabled = false,
  allowCustomInput = false,

  // ⭐ NEW PROP
  disableCapitalize = false,
}) => {
  const [localOptions, setLocalOptions] = useState([]);

  // ⭐ Apply capitalization conditionally
  useEffect(() => {
    if (disableCapitalize) {
      setLocalOptions(options); // keep EXACT labels
    } else {
      const formatted = options.map((opt) => ({
        ...opt,
        label: capitalizeLabel(opt.label),
      }));
      setLocalOptions(formatted);
    }
  }, [options, disableCapitalize]);

  const handleChange = (selectedOption) => {
    onChange?.(selectedOption, { name });
  };

  // ⭐ Create item conditionally capitalized
  const handleCreate = (inputValue) => {
    const formatted = disableCapitalize
      ? inputValue
      : capitalizeLabel(inputValue);

    const newOption = { label: formatted, value: formatted };

    setLocalOptions((prev) => {
      const exists = prev.some((opt) => opt.value === formatted);
      return exists ? prev : [...prev, newOption];
    });

    onChange?.(newOption, { name });
  };

  const filterOption = (option, rawInput) => {
    if (!rawInput) return true;
    const search = rawInput.toLowerCase();

    const label = option.label?.toString().toLowerCase() || "";
    const value = option.value?.toString().toLowerCase() || "";

    return label.startsWith(search) || value.startsWith(search);
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
