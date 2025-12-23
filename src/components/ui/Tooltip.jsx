// import React from "react";
// import Tippy from "@tippyjs/react";
// import "tippy.js/dist/tippy.css";
// import "tippy.js/dist/tippy.css";
// import "tippy.js/themes/light.css";
// import "tippy.js/themes/light-border.css";
// import "tippy.js/animations/shift-away.css";
// import "tippy.js/animations/scale-subtle.css";
// import "tippy.js/animations/perspective-extreme.css";
// import "tippy.js/animations/perspective-subtle.css";
// import "tippy.js/animations/perspective.css";
// import "tippy.js/animations/scale-extreme.css";
// import "tippy.js/animations/scale-subtle.css";
// import "tippy.js/animations/scale.css";
// import "tippy.js/animations/shift-away-extreme.css";
// import "tippy.js/animations/shift-away-subtle.css";
// import "tippy.js/animations/shift-away.css";
// import "tippy.js/animations/shift-toward-extreme.css";
// import "tippy.js/animations/shift-toward-subtle.css";
// import "tippy.js/animations/shift-toward.css";

// const Tooltip = ({
//   children,
//   content = "content",
//   title,
//   className = "btn btn-dark",
//   placement = "top",
//   arrow = true,
//   theme="light-border",
//   animation = "shift-away",
//   trigger = "mouseenter focus",
//   interactive = false,
//   allowHTML = false,
//   maxWidth = 300,
//   duration = 200,
// }) => {
//   return (
//     <div className="custom-tippy">
//       <Tippy
//         content={content}
//         placement={placement}
//         arrow={arrow}
//         theme={theme}
//         animation={animation}
//         trigger={trigger}
//         interactive={interactive}
//         allowHTML={allowHTML}
//         maxWidth={maxWidth}
//         duration={duration}
//       >
//         {children ? children : <button className={className}>{title}</button>}
//       </Tippy>
//     </div>
//   );
// };

// export default Tooltip;
import React from "react";
import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css'; // Essential base styles
import 'tippy.js/themes/light.css';

const Tooltip = ({
  label,
  tooltipContent,
  children,
  required = false,
  error,
  tooltipPlacement = "top",
  tooltipMaxWidth = 250
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="field-label">
          {label}
        </label>
        {tooltipContent && (
          <Tippy
            content={tooltipContent}
            placement={tooltipPlacement}
            theme="light"
            maxWidth={tooltipMaxWidth}
            arrow={true}
          >
            <button
              type="button"
              className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium hover:bg-blue-200 transition-colors"
              aria-label={`Information about ${label}`}
            >
              i
            </button>
          </Tippy>
        )}
      </div>
      {children}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default Tooltip;