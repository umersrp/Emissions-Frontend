
// import React, { useState } from "react";
// import Icon from "@/components/ui/Icon";
// import Cleave from "cleave.js/react";
// import "cleave.js/dist/addons/cleave-phone.us";

// const InputGroup = ({
//   type = "text", // text, password, email, number, textarea
//   label,
//   placeholder,
//   classLabel = "form-label",
//   className = "",
//   classGroup = "",
//   register, // Remove this if not using React Hook Form
//   name,
//   readonly,
//   value,
//   error,
//   icon,
//   disabled,
//   id,
//   horizontal,
//   validate,
//   isMask,
//   msgTooltip,
//   description,
//   hasicon,
//   onChange,
//   merged,
//   append,
//   prepend,
//   options,
//   onFocus,
//   rows = 3,
//   ...rest
// }) => {
//   const [open, setOpen] = useState(false);
//   const handleOpen = () => {
//     setOpen(!open);
//   };

//   // Base classes for consistent placeholder styling
//   const placeholderClasses = disabled 
//     ? "placeholder:text-gray-400 placeholder:opacity-50 placeholder:text-[14px] placeholder:font-normal" 
//     : "placeholder:text-gray-700 placeholder:opacity-75 placeholder:text-[14px] placeholder:font-normal";

//   // Create common props for all input types
//   const commonInputProps = {
//     name,
//     placeholder,
//     readOnly: readonly,
//     disabled,
//     id,
//     value: value || "", // Always ensure value is set
//     onChange: onChange,
//     className: `${error ? "has-error" : ""} border-[2px] border-gray-400 rounded-md input-group-control block w-full focus:outline-none py-2 ${placeholderClasses} ${className}`,
//     ...rest,
//   };

//   // Textarea specific props
//   if (type === "textarea") {
//     commonInputProps.rows = rows;
//   }

//   return (
//     <div className={`${horizontal ? "flex" : ""} ${merged ? "merged" : ""}`}>
//       {label && (
//         <label
//           htmlFor={id}
//           className={`block capitalize ${classLabel} ${
//             horizontal ? "flex-0 mr-6 md:w-[100px] w-[60px] break-words" : ""
//           }`}
//         >
//           {label}
//         </label>
//       )}
//       <div
//         className={`flex items-stretch inputGroup 
//           ${append ? "has-append" : ""}
//           ${prepend ? "has-prepend" : ""}
//           ${error ? "is-invalid" : ""}  
//           ${validate ? "is-valid" : ""}
//           ${horizontal ? "flex-1" : ""}
//         `}
//       >
//         {prepend && (
//           <span className="flex-none input-group-addon">
//             <div className="input-group-text h-full prepend-slot">
//               {prepend}
//             </div>
//           </span>
//         )}
//         <div className="flex-1">
//           <div
//             className={`relative fromGroup2
//               ${error ? "has-error" : ""} 
//               ${validate ? "is-valid" : ""}
//               ${type === "textarea" ? "h-auto" : ""}
//             `}
//           >
//             {!isMask ? (
//               type === "textarea" ? (
//                 <textarea {...commonInputProps} />
//               ) : (
//                 <input
//                   type={type === "password" && open ? "text" : type}
//                   {...commonInputProps}
//                 />
//               )
//             ) : (
//               <Cleave
//                 options={options}
//                 onFocus={onFocus}
//                 {...commonInputProps}
//               />
//             )}
            
//             {/* icon - only show for password inputs */}
//             {(hasicon && type === "password") && (
//               <div className="flex text-xl absolute ltr:right-[14px] rtl:left-[14px] top-1/2 -translate-y-1/2 space-x-1 rtl:space-x-reverse">
//                 <span
//                   className="cursor-pointer text-secondary-500"
//                   onClick={handleOpen}
//                 >
//                   {open && type === "password" && (
//                     <Icon icon="heroicons-outline:eye" />
//                   )}
//                   {!open && type === "password" && (
//                     <Icon icon="heroicons-outline:eye-off" />
//                   )}
//                 </span>
//               </div>
//             )}
            
//             {/* error and validation icons for non-textarea */}
//             {type !== "textarea" && (
//               <div className="flex text-xl absolute ltr:right-[14px] rtl:left-[14px] top-1/2 -translate-y-1/2 space-x-1 rtl:space-x-reverse">
//                 {error && (
//                   <span className="text-danger-500">
//                     <Icon icon="heroicons-outline:information-circle" />
//                   </span>
//                 )}
//                 {validate && (
//                   <span className="text-success-500">
//                     <Icon icon="bi:check-lg" />
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//         {append && (
//           <span className="flex-none input-group-addon right">
//             <div className="input-group-text h-full append-slot">{append}</div>
//           </span>
//         )}
//       </div>
      
//       {error && (
//         <div className={`mt-2 ${msgTooltip ? "inline-block bg-danger-500 text-white text-[10px] px-2 py-1 rounded" : "text-danger-500 block text-sm"}`}>
//           {error.message}
//         </div>
//       )}
      
//       {validate && (
//         <div className={`mt-2 ${msgTooltip ? "inline-block bg-success-500 text-white text-[10px] px-2 py-1 rounded" : "text-success-500 block text-sm"}`}>
//           {validate}
//         </div>
//       )}
      
//       {description && <span className="input-description">{description}</span>}
//     </div>
//   );
// };

// export default InputGroup;

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import Cleave from "cleave.js/react";
import "cleave.js/dist/addons/cleave-phone.us";

const InputGroup = ({
  type = "text", // text, password, email, number, textarea
  label,
  placeholder,
  classLabel = "form-label",
  className = "",
  classGroup = "",
  register, // Remove this if not using React Hook Form
  name,
  readonly,
  value,
  error,
  icon,
  disabled,
  id,
  horizontal,
  validate,
  isMask,
  msgTooltip,
  description,
  hasicon,
  onChange,
  merged,
  append,
  prepend,
  options,
  onFocus,
  rows = 3,
  min, // Add min prop for number validation
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const [internalError, setInternalError] = useState(null); // For internal validation errors
  
  const handleOpen = () => {
    setOpen(!open);
  };

  // Handle number input wheel to prevent scroll from changing value
  // const handleNumberInputWheel = (e) => {
  //   if (type === "number") {
  //     e.target.blur();
  //     e.preventDefault();
  //   }
  // };
  const handleNumberInputWheel = (e) => {
    if (type === "number") {
        // First blur to prevent scroll from changing the value
        e.target.blur();
        // Then prevent default
        // e.preventDefault();
        // e.stopPropagation();
        // return false;
    }
};

  // Handle number input changes with validation
  const handleNumberChange = (e) => {
    const inputValue = e.target.value;
    
    // Clear internal error on new input
    setInternalError(null);
    
    // Check for negative numbers
    if (type === "number" && inputValue !== "" && parseFloat(inputValue) < 0) {
      setInternalError("Value cannot be negative");
      return; // Don't call onChange for negative values
    }
    
    // If there's a min prop, validate against it
    if (type === "number" && min !== undefined && inputValue !== "" && parseFloat(inputValue) < min) {
      setInternalError(`Value must be at least ${min}`);
      return;
    }
    
    // Call the original onChange if provided
    if (onChange) {
      onChange(e);
    }
  };

  // Combine external and internal errors
  const combinedError = error || internalError;

  // Base classes for consistent placeholder styling
  const placeholderClasses = disabled 
    ? "placeholder:text-gray-400 placeholder:opacity-50 placeholder:text-[14px] placeholder:font-normal" 
    : "placeholder:text-gray-700 placeholder:opacity-75 placeholder:text-[14px] placeholder:font-normal";

  // Create common props for all input types
  const commonInputProps = {
    name,
    placeholder,
    readOnly: readonly,
    disabled,
    id,
    value: value || "", // Always ensure value is set
    onChange: type === "number" ? handleNumberChange : onChange, // Use custom handler for numbers
    onWheel: type === "number" ? handleNumberInputWheel : undefined, // Add wheel handler for numbers
    min: type === "number" && min !== undefined ? min : undefined, // Add min attribute for numbers
    className: `${combinedError ? "has-error border-red-500" : "border-[2px] border-gray-300"} rounded-md input-group-control block w-full focus:outline-none py-2 ${placeholderClasses} ${className}`,
    ...rest,
  };

  // Add number-specific props
  if (type === "number") {
    commonInputProps.onWheel = handleNumberInputWheel;
    commonInputProps.onKeyDown = (e) => {
      // Prevent 'e' and 'E' characters in number inputs
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
      }
    };
  }

  // Textarea specific props
  if (type === "textarea") {
    commonInputProps.rows = rows;
  }

  return (
    <div className={`${horizontal ? "flex" : ""} ${merged ? "merged" : ""}`}>
      {label && (
        <label
          htmlFor={id}
          className={`block capitalize ${classLabel} ${
            horizontal ? "flex-0 mr-6 md:w-[100px] w-[60px] break-words" : ""
          }`}
        >
          {label}
        </label>
      )}
      <div
        className={`flex items-stretch inputGroup 
          ${append ? "has-append" : ""}
          ${prepend ? "has-prepend" : ""}
          ${combinedError ? "is-invalid" : ""}  
          ${validate ? "is-valid" : ""}
          ${horizontal ? "flex-1" : ""}
        `}
      >
        {prepend && (
          <span className="flex-none input-group-addon">
            <div className="input-group-text h-full prepend-slot">
              {prepend}
            </div>
          </span>
        )}
        <div className="flex-1">
          <div
            className={`relative fromGroup2
              ${combinedError ? "has-error" : ""} 
              ${validate ? "is-valid" : ""}
              ${type === "textarea" ? "h-auto" : ""}
            `}
          >
            {!isMask ? (
              type === "textarea" ? (
                <textarea {...commonInputProps} />
              ) : (
                <input
                  type={type === "password" && open ? "text" : type}
                  {...commonInputProps}
                />
              )
            ) : (
              <Cleave
                options={options}
                onFocus={onFocus}
                {...commonInputProps}
              />
            )}
            
            {/* icon - only show for password inputs */}
            {(hasicon && type === "password") && (
              <div className="flex text-xl absolute ltr:right-[14px] rtl:left-[14px] top-1/2 -translate-y-1/2 space-x-1 rtl:space-x-reverse">
                <span
                  className="cursor-pointer text-secondary-500"
                  onClick={handleOpen}
                >
                  {open && type === "password" && (
                    <Icon icon="heroicons-outline:eye" />
                  )}
                  {!open && type === "password" && (
                    <Icon icon="heroicons-outline:eye-off" />
                  )}
                </span>
              </div>
            )}
            
            {/* error and validation icons for non-textarea */}
            {type !== "textarea" && (
              <div className="flex text-xl absolute ltr:right-[14px] rtl:left-[14px] top-1/2 -translate-y-1/2 space-x-1 rtl:space-x-reverse">
                {combinedError && (
                  <span className="text-danger-500">
                    <Icon icon="heroicons-outline:information-circle" />
                  </span>
                )}
                {validate && (
                  <span className="text-success-500">
                    <Icon icon="bi:check-lg" />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {append && (
          <span className="flex-none input-group-addon right">
            <div className="input-group-text h-full append-slot">{append}</div>
          </span>
        )}
      </div>
      
      {combinedError && (
        <div className={`mt-2 ${msgTooltip ? "inline-block bg-danger-500 text-white text-[10px] px-2 py-1 rounded" : "text-danger-500 block text-sm"}`}>
          {combinedError.message || combinedError}
        </div>
      )}
      
      {validate && (
        <div className={`mt-2 ${msgTooltip ? "inline-block bg-success-500 text-white text-[10px] px-2 py-1 rounded" : "text-success-500 block text-sm"}`}>
          {validate}
        </div>
      )}
      
      {description && <span className="input-description">{description}</span>}
    </div>
  );
};

export default InputGroup;