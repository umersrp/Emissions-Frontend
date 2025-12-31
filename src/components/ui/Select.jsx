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
// import React, { useState, useEffect } from "react";
// import Select from "react-select";
// import CreatableSelect from "react-select/creatable";
// import { components } from "react-select";

// const primary500 = "#4098ab";
// const primary900 = "#4097ab7a";

// //  Capitalize helper
// // const capitalizeLabel = (text) => {
// //   if (!text || typeof text !== "string") return text;
// //   return text.charAt(0).toUpperCase() + text.slice(1);
// // };
//   const capitalizeLabel = (text) => {
//   if (!text) return "";

//   const exceptions = ["and", "or"];
//   return text
//     .split(" ")
//     .map((word, index) => {
//       // Always capitalize the first word
//       if (index === 0) return word.charAt(0).toUpperCase() + word.slice(1);
//       // Don't capitalize exceptions
//       if (exceptions.includes(word.toLowerCase())) return word.toLowerCase();
//       return word.charAt(0).toUpperCase() + word.slice(1);
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
//     color: state.isDisabled ? "#9ca3af" : "#6b7280",
//   }),
// };

// // ▼ Custom arrow
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

//   // NEW PROP
//   disableCapitalize = false,
// }) => {
//   const [localOptions, setLocalOptions] = useState([]);

//   //  Apply capitalization conditionally
//   useEffect(() => {
//     if (disableCapitalize) {
//       setLocalOptions(options); // keep EXACT labels
//     } else {
//       const formatted = options.map((opt) => ({
//         ...opt,
//         label: capitalizeLabel(opt.label),
//       }));
//       setLocalOptions(formatted);
//     }
//   }, [options, disableCapitalize]);

//   const handleChange = (selectedOption) => {
//     onChange?.(selectedOption, { name });
//   };

//   // ⭐ Create item conditionally capitalized
//   const handleCreate = (inputValue) => {
//     const formatted = disableCapitalize
//       ? inputValue
//       : capitalizeLabel(inputValue);

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

//     const label = option.label?.toString().toLowerCase() || "";
//     const value = option.value?.toString().toLowerCase() || "";

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

import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { components } from "react-select";

const primary500 = "#4098ab";
const primary900 = "#4097ab7a";

// const capitalizeLabel = (text) => {
//   if (!text) return "";

//   const exceptions = [
//     "and","or","in","of","from","at","to","the","a","an","for","on","with",
//     "but","by","is","it","as","be","this","that","these","those","such",
//     "if","e.g.,","i.e.","kg","via","etc.","vs.","per","e.g.","on-site","can","will","not","cause","onsite",
//     "n.e.c.","cc","cc+"
//   ];

//   return text
//     .split(" ")
//     .map((word, index) => {
//       const hasOpenParen = word.startsWith("(");
//       const hasCloseParen = word.endsWith(")");

//       let coreWord = word;
//       if (hasOpenParen) coreWord = coreWord.slice(1);
//       if (hasCloseParen) coreWord = coreWord.slice(0, -1);

//       const lowerCore = coreWord.toLowerCase();
//       let result;

//       // 🔥 Special rule for "it" at first position
//       if (index === 0 && lowerCore === "it") {
//         result = "IT";
//       }
//       // First word general rule
//       else if (index === 0) {
//         result = coreWord.charAt(0).toUpperCase() + coreWord.slice(1);
//       }
//       // Exception words in middle
//       else if (exceptions.includes(lowerCore)) {
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
const capitalizeLabel = (text) => {
  if (!text) return "";
  

  const exceptions = [
    "and", "or", "in", "of", "from", "at", "to", "the", "a", "an", "for", "on", "with",
    "but", "by", "is", "it", "as", "be", "this", "that", "these", "those", "such",
    "if", "e.g.,", "i.e.", "kg", "via", "etc.", "vs.", "per", "e.g.", "on-site", "can", "will", "not", "cause", "onsite",
    "n.e.c.", "cc", "cc+",
  ];

  // Special handling for "a" - we'll preserve its original case
  return text
    .split(" ")
    .map((word, index) => {
      const hasOpenParen = word.startsWith("(");
      const hasCloseParen = word.endsWith(")");

      let coreWord = word;
      if (hasOpenParen) coreWord = coreWord.slice(1);
      if (hasCloseParen) coreWord = coreWord.slice(0, -1);

      const lowerCore = coreWord.toLowerCase();
      let result;
      //  SPECIAL RULE: If word is "a" or "A", preserve original case
      if (coreWord === "a" || coreWord === "A" || coreWord === "it" || coreWord === "IT") {
        result = coreWord; // Keep as-is: "a" stays "a", "A" stays "A"
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
    color: state.isDisabled ? "#9CA3AF" : "#6B7280",
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

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder,
  name,
  isDisabled = false,
  allowCustomInput = false,
  disableCapitalize = false,
}) => {
  const [customOptions, setCustomOptions] = useState([]);

  //  FIX: Use useMemo instead of useEffect to avoid infinite loops
  const formattedOptions = useMemo(() => {
    if (disableCapitalize) {
      return options;
    }
    return options.map((opt) => ({
      ...opt,
      label: capitalizeLabel(opt.label),
    }));
  }, [options, disableCapitalize]);

  //  Merge formatted options with custom created options
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
    options: allOptions,
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