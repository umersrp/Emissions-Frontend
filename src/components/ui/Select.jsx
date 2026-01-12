
// import React, { useState, useEffect, useMemo } from "react";
// import Select from "react-select";
// import CreatableSelect from "react-select/creatable";
// import { components } from "react-select";

// const primary500 = "#4098ab";
// const primary900 = "#4097ab7a";

// const capitalizeLabel = (text) => {
//   if (!text) return "";
  
//   const exceptions = [
//     "and", "or", "in", "of", "from", "at", "to", "the", "a", "an", "for", "on", "with",
//     "but", "by", "is", "it", "as", "be", "this", "that", "these", "those", "such",
//     "if", "e.g.,", "i.e.", "kg", "via", "etc.", "vs.", "per", "e.g.", "on-site", "can", "will", "not", "cause", "onsite",
//     "n.e.c.", "cc", "cc+", "kwh","up","km"
//   ];
//   const preserveExact = ["kWh", "MWh", "GWh", "MJ", "GJ", "TJ", "BTU", "MMBtu", "m³", "ft³", "in³"];
  
//   //   Add spaces around slashes first
//   const textWithSpaces = text.replace(/\s*\/\s*/g, ' / ');
  
//   return textWithSpaces
//     .split(" ")
//     .map((word, index) => {
//       //  If word is just "/", keep it as is
//       if (word === "/") return word;
      
//       const hasOpenParen = word.startsWith("(");
//       const hasCloseParen = word.endsWith(")");

//       let coreWord = word;
//       if (hasOpenParen) coreWord = coreWord.slice(1);
//       if (hasCloseParen) coreWord = coreWord.slice(0, -1);

//       if (preserveExact.includes(coreWord)) {
//         let result = coreWord;
//         if (hasOpenParen) result = "(" + result;
//         if (hasCloseParen) result = result + ")";
//         return result;
//       }

//       const lowerCore = coreWord.toLowerCase();
//       let result;
      
//       //  If word is "a" or "A", preserve original case
//       if (coreWord === "a" || coreWord === "A" || coreWord === "it" || coreWord === "IT") {
//         result = coreWord;
//       }
//       // Single letters (except "a" already handled)
//       else if (coreWord.length === 1 && /^[A-Za-z]$/.test(coreWord)) {
//         result = coreWord.toUpperCase();
//       }
//       // First word
//       else if (index === 0) {
//         result = coreWord.charAt(0).toUpperCase() + coreWord.slice(1);
//       }
//       // Exception words (excluding "a" which we already handled)
//       else if (exceptions.includes(lowerCore) && lowerCore !== "a") {
//         result = lowerCore;
//       }
//       // Normal capitalization
//       else {
//         result = coreWord.charAt(0).toUpperCase() + coreWord.slice(1);
//       }
      
//       // Reattach parentheses
//       if (hasOpenParen) result = "(" + result;
//       if (hasCloseParen) result = result + ")";

//       return result;
//     })
//     .join(" ");
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
//       ? "#000000"
//       : "#d1d5db",
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
//       : state.isFocused
//       ? "#e5f4f7"
//       : "transparent",
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
//     color: state.isDisabled ? "#9CA3AF" : "#6B7280",
//   }),
// };

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
//   disableCapitalize = false,
// }) => {
//   const [customOptions, setCustomOptions] = useState([]);

//   //  FIX: Use useMemo instead of useEffect to avoid infinite loops
//   const formattedOptions = useMemo(() => {
//     if (disableCapitalize) {
//       return options;
//     }
//     return options.map((opt) => ({
//       ...opt,
//       label: capitalizeLabel(opt.label),
//     }));
//   }, [options, disableCapitalize]);

//   //  Merge formatted options with custom created options
//   const allOptions = useMemo(() => {
//     const merged = [...formattedOptions];
//     customOptions.forEach((customOpt) => {
//       if (!merged.some((opt) => opt.value === customOpt.value)) {
//         merged.push(customOpt);
//       }
//     });
//     return merged;
//   }, [formattedOptions, customOptions]);

//   const handleChange = (selectedOption) => {
//     onChange?.(selectedOption, { name });
//   };

//   const handleCreate = (inputValue) => {
//     const formatted = disableCapitalize
//       ? inputValue
//       : capitalizeLabel(inputValue);

//     const newOption = { label: formatted, value: formatted };

//     setCustomOptions((prev) => {
//       const exists = prev.some((opt) => opt.value === formatted);
//       return exists ? prev : [...prev, newOption];
//     });

//     onChange?.(newOption, { name });
//   };

//   const filterOption = (option, rawInput) => {
//     if (!rawInput) return true;
//     const search = rawInput.toLowerCase();

//     const label = option.label?.toString().toLowerCase() || "";
//     const value = option.value?.toString().toLowerCase() || "";

//     return label.startsWith(search) || value.startsWith(search);
//   };

//   const commonProps = {
//     name,
//     options: allOptions,
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

import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { components } from "react-select";

const primary500 = "#4098ab";
const primary900 = "#4097ab7a";

const capitalizeLabel = (text) => {
  if (!text) return "";
  
  const exceptions = [
    "and", "or", "in", "of", "from", "at", "to", "the", "a", "an", "for", "on", "with",
    "but", "by", "is", "it", "as", "be", "this", "that", "these", "those", "such",
    "if", "e.g.,", "i.e.", "kg", "via", "etc.", "vs.", "per", "e.g.", "on-site", "can", "will", "not", "cause", "onsite",
    "n.e.c.", "cc", "cc+", "kwh","up","km"
  ];
  const preserveExact = ["kWh", "MWh", "GWh", "MJ", "GJ", "TJ", "BTU", "MMBtu", "m³", "ft³", "in³"];
  
  // Add spaces around slashes first
  const textWithSpaces = text.replace(/\s*\/\s*/g, ' / ');
  
  return textWithSpaces
    .split(" ")
    .map((word, index) => {
      // If word is just "/", keep it as is
      if (word === "/") return word;
      
      const hasOpenParen = word.startsWith("(");
      const hasCloseParen = word.endsWith(")");

      let coreWord = word;
      if (hasOpenParen) coreWord = coreWord.slice(1);
      if (hasCloseParen) coreWord = coreWord.slice(0, -1);

      if (preserveExact.includes(coreWord)) {
        let result = coreWord;
        if (hasOpenParen) result = "(" + result;
        if (hasCloseParen) result = result + ")";
        return result;
      }

      const lowerCore = coreWord.toLowerCase();
      let result;
      
      // If word is "a" or "A", preserve original case
      if (coreWord === "a" || coreWord === "A" || coreWord === "it" || coreWord === "IT") {
        result = coreWord;
      }
      // Single letters (except "a" already handled)
      else if (coreWord.length === 1 && /^[A-Za-z]$/.test(coreWord)) {
        result = coreWord.toUpperCase();
      }
      // First word
      else if (index === 0) {
        result = coreWord.charAt(0).toUpperCase() + coreWord.slice(1);
      }
      // Exception words (excluding "a" which we already handled)
      else if (exceptions.includes(lowerCore) && lowerCore !== "a") {
        result = lowerCore;
      }
      // Normal capitalization
      else {
        result = coreWord.charAt(0).toUpperCase() + coreWord.slice(1);
      }
      
      // Reattach parentheses
      if (hasOpenParen) result = "(" + result;
      if (hasCloseParen) result = result + ")";

      return result;
    })
    .join(" ");
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
      ? primary500
      : state.isFocused
      ? "#e5f4f7"
      : "transparent",
    color: state.isSelected ? "#fff" : "#000",
    "&:hover": {
      backgroundColor: "#e5f4f7",
      color: "#000",
    },
  }),
  multiValue: (base, state) => ({
    ...base,
    backgroundColor: primary900,
    borderRadius: "6px",
  }),
  multiValueLabel: (base, state) => ({
    ...base,
    color: "#fff",
    fontWeight: "500",
    padding: "4px 8px",
  }),
  multiValueRemove: (base, state) => ({
    ...base,
    color: "#fff",
    borderRadius: "0 6px 6px 0",
    "&:hover": {
      backgroundColor: "#e53e3e",
      color: "#fff",
    },
  }),
  valueContainer: (base, state) => ({
    ...base,
    padding: state.hasValue ? "4px 8px" : "8px",
    flexWrap: state.isMulti ? "wrap" : "nowrap",
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
    color: state.isDisabled ? "#9CA3AF" : "#6B7280",
  }),
  input: (base, state) => ({
    ...base,
    color: "#000",
    margin: "0",
    padding: "0",
  }),
};

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

// Custom MultiValueContainer for better styling
const MultiValueContainer = (props) => {
  return (
    <components.MultiValueContainer {...props}>
      <div className="flex items-center bg-primary/20 rounded-md m-1">
        {props.children}
      </div>
    </components.MultiValueContainer>
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
  disableCapitalize = false,
  isMulti = false, // New prop for multi-select
  maxSelection = null, // Optional: limit max selections
  isOptionDisabled = null, // Optional: function to disable options
  closeMenuOnSelect = null, // Control if menu should close on selection
}) => {
  const [customOptions, setCustomOptions] = useState([]);

  // FIX: Use useMemo instead of useEffect to avoid infinite loops
  const formattedOptions = useMemo(() => {
    if (disableCapitalize) {
      return options;
    }
    return options.map((opt) => ({
      ...opt,
      label: capitalizeLabel(opt.label),
    }));
  }, [options, disableCapitalize]);

  // Merge formatted options with custom created options
  const allOptions = useMemo(() => {
    const merged = [...formattedOptions];
    customOptions.forEach((customOpt) => {
      if (!merged.some((opt) => opt.value === customOpt.value)) {
        merged.push(customOpt);
      }
    });
    return merged;
  }, [formattedOptions, customOptions]);

  const handleChange = (selectedOption) => {
    // Handle both single and multi-select
    if (isMulti) {
      // If maxSelection is set and we're trying to add more
      if (maxSelection && selectedOption?.length > maxSelection) {
        // Keep only the first maxSelection items
        selectedOption = selectedOption.slice(0, maxSelection);
      }
    }
    
    onChange?.(selectedOption, { name });
  };

  const handleCreate = (inputValue) => {
    const formatted = disableCapitalize
      ? inputValue
      : capitalizeLabel(inputValue);

    const newOption = { label: formatted, value: formatted };

    setCustomOptions((prev) => {
      const exists = prev.some((opt) => opt.value === formatted);
      return exists ? prev : [...prev, newOption];
    });

    if (isMulti) {
      // For multi-select, add the new option to existing selection
      const newValue = Array.isArray(value) 
        ? [...value, newOption]
        : [newOption];
      onChange?.(newValue, { name });
    } else {
      // For single select, replace the selection
      onChange?.(newOption, { name });
    }
  };

  const filterOption = (option, rawInput) => {
    if (!rawInput) return true;
    const search = rawInput.toLowerCase();

    const label = option.label?.toString().toLowerCase() || "";
    const value = option.value?.toString().toLowerCase() || "";

    return label.startsWith(search) || value.startsWith(search);
  };

  // Custom option disabled logic
  const customIsOptionDisabled = (option) => {
    // First check if the prop function returns true
    if (isOptionDisabled && isOptionDisabled(option)) {
      return true;
    }
    
    // If maxSelection is set and reached, disable all other options
    if (isMulti && maxSelection && Array.isArray(value) && value.length >= maxSelection) {
      // Check if this option is already selected
      const isAlreadySelected = value.some(
        (selected) => selected.value === option.value
      );
      // If not already selected and max reached, disable it
      return !isAlreadySelected;
    }
    
    return false;
  };

  const commonProps = {
    name,
    options: allOptions,
    value,
    onChange: handleChange,
    placeholder: placeholder || (isMulti ? "Select options..." : "Select..."),
    styles: customStyles,
    isDisabled,
    isMulti,
    isOptionDisabled: customIsOptionDisabled,
    components: { 
      DropdownIndicator,
      MultiValueContainer: isMulti ? MultiValueContainer : components.MultiValueContainer,
    },
    classNamePrefix: "custom-select",
    isClearable: true,
    filterOption,
    menuPlacement: "bottom",
    closeMenuOnSelect: closeMenuOnSelect !== null ? closeMenuOnSelect : !isMulti, // Default: close for single, stay open for multi
    hideSelectedOptions: isMulti ? false : true, // Don't hide selected in multi-select
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
    <CreatableSelect 
      {...commonProps} 
      onCreateOption={handleCreate}
      isMulti={isMulti}
    />
  ) : (
    <Select {...commonProps} />
  );
};

export default CustomSelect;