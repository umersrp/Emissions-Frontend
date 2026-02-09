
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

const InputGroup = React.forwardRef((props, ref) => {
  const {
    type = "text",
    label,
    placeholder,
    classLabel = "form-label",
    className = "",
    classGroup = "",
    register,
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
    min,
    // Extract ALL custom props that shouldn't go to DOM elements
    helperText, 
    isLoading, // Add this - it's causing the warning
    ...rest // This will contain all other props that can go to DOM
  } = props;

  const [open, setOpen] = useState(false);
  const [internalError, setInternalError] = useState(null);
  
  const handleOpen = () => {
    setOpen(!open);
  };

  const handleNumberInputWheel = (e) => {
    if (type === "number") {
      e.target.blur();
    }
  };

  const handleNumberChange = (e) => {
    const inputValue = e.target.value;
    
    setInternalError(null);
    
    if (type === "number" && inputValue !== "" && parseFloat(inputValue) < 0) {
      setInternalError("Value cannot be negative");
      return;
    }
    
    if (type === "number" && min !== undefined && inputValue !== "" && parseFloat(inputValue) < min) {
      setInternalError(`Value must be at least ${min}`);
      return;
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  const combinedError = error || internalError;

  const placeholderClasses = disabled 
    ? "placeholder:text-gray-400 placeholder:opacity-50 placeholder:text-[14px] placeholder:font-normal" 
    : "placeholder:text-gray-700 placeholder:opacity-75 placeholder:text-[14px] placeholder:font-normal";

  const commonInputProps = {
    name,
    placeholder,
    readOnly: readonly,
    disabled,
    id,
    value: value || "",
    onChange: type === "number" ? handleNumberChange : onChange,
    onWheel: type === "number" ? handleNumberInputWheel : undefined,
    min: type === "number" && min !== undefined ? min : undefined,
    className: `${combinedError ? "has-error border-red-500" : "border-[2px] border-gray-300"} rounded-md input-group-control block w-full focus:outline-none py-2 ${placeholderClasses} ${className}`,
    ...rest,
  };

  if (type === "number") {
    commonInputProps.onWheel = handleNumberInputWheel;
    commonInputProps.onKeyDown = (e) => {
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
      }
    };
  }

  if (type === "textarea") {
    commonInputProps.rows = rows;
  }

  return (
    <div 
      className={`${horizontal ? "flex" : ""} ${merged ? "merged" : ""} ${classGroup}`}
      ref={ref}
      // Only pass valid DOM props
    >
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
            
            {/* Show loading spinner if isLoading is true */}
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Icon icon="heroicons:arrow-path" className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            )}
            
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
            
            {type !== "textarea" && !isLoading && (
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
      
      {helperText && !combinedError && (
        <div className="mt-1 text-sm text-gray-500">
          {helperText}
        </div>
      )}
      
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
});

InputGroup.displayName = "InputGroup";

export default InputGroup;