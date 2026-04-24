// import React, { useEffect, useState } from "react";
// import { NavLink, useLocation, useNavigate } from "react-router-dom";
// import Icon from "@/components/ui/Icon";
// import { toggleActiveChat } from "@/pages/app/chat/store";
// import { useDispatch, useSelector } from "react-redux";
// import useMobileMenu from "@/hooks/useMobileMenu";
// import Submenu from "./Submenu";

// const Navmenu = ({ menus }) => {
//   const [activeSubmenu, setActiveSubmenu] = useState(null);
//   const [activeMultiMenu, setMultiMenu] = useState(null);
//   const user = useSelector((state) => state.auth.user);
//   const dispatch = useDispatch();
//   const location = useLocation();
//   const locationName = location.pathname.replace("/", "");
//   const [mobileMenu, setMobileMenu] = useMobileMenu();
//   const navigate = useNavigate();

//   const toggleSubmenu = (i) => {
//     setActiveSubmenu(activeSubmenu === i ? null : i);
//   };

//   const toggleMultiMenu = (j) => {
//     setMultiMenu(activeMultiMenu === j ? null : j);
//   };

//   // const isLocationMatch = (targetLocation) =>
//   //   locationName === targetLocation || locationName.startsWith(`${targetLocation}/`);
//   const isExactParent = (targetLocation) =>
//     locationName.toLowerCase() === targetLocation.toLowerCase();

//   const isChildMatch = (targetLocation) =>
//     locationName.toLowerCase().startsWith(targetLocation.toLowerCase() + "/");


//   useEffect(() => {
//     // Only update submenu if nothing is currently active
//     if (activeSubmenu === null) {
//       let submenuIndex = null;
//       let multiMenuIndex = null;

//       menus.forEach((item, i) => {
//         // if (isLocationMatch(item.link)) submenuIndex = i;
//         if (isExactParent(item.link)) {
//           submenuIndex = i;
//         }

//         if (item.child) {
//           item.child.forEach((childItem, j) => {
//             if (isLocationMatch(childItem.childlink)) submenuIndex = i;
//             if (childItem.multi_menu) {
//               childItem.multi_menu.forEach((nestedItem) => {
//                 if (isLocationMatch(nestedItem.multiLink)) {
//                   submenuIndex = i;
//                   multiMenuIndex = j;
//                 }
//               });
//             }
//           });
//         }
//       });

//       setActiveSubmenu(submenuIndex);
//       setMultiMenu(multiMenuIndex);
//     }

//     dispatch(toggleActiveChat(false));
//     if (mobileMenu) setMobileMenu(false);
//   }, [location]);


//   // Filter menus based on user type
//   const filteredMenus = menus.filter((menu) => {
//     if (user?.type === "company") {
//       return menu.link !== "Sector-table" && menu.link !== "Industry" && menu.link !== "Company";
//     } else if (user?.type === "admin") {
//       return menu.link === "Sector-table" || menu.link === "Industry" || menu.link === "Company";
//     } else if (user?.type === "user") {
//       return menu.title === "Venue" || menu.title === "Booking" || menu.title === "Rider";
//     }
//     return false;
//   });

//   const handleParentClick = (i, link) => {
//     toggleSubmenu(i); // toggle arrow/submenu

//     // Navigate after a short delay to let React render the rotation
//     setTimeout(() => {
//       navigate(link);
//     }, 100); // 100ms is enough
//   };

//   return (
//     <ul>
//       {filteredMenus.map((item, i) => (
//         <li
//           key={i}
//           className={`single-sidebar-menu 
//             ${item.child ? "item-has-children" : ""} 
//             ${activeSubmenu === i ? "open" : ""} 
//             ${locationName === item.link ? "menu-item-active" : ""}`}
//         >
//           {/* Single menu with no children */}
//           {/* {!item.child && !item.isHeadr && (
//             <NavLink className="menu-link" to={item.link}>
//               <span className="menu-icon flex-grow-0">
//                 <Icon icon={item.icon} />
//               </span>
//               <div className="text-box flex-grow">{item.title}</div>
//               {item.badge && <span className="menu-badge">{item.badge}</span>}
//             </NavLink>
//           )} */}
//           {/* Single menu with no children */}
//           {!item.child && !item.isHeadr && (
//             <NavLink
//               className="menu-link"
//               to={item.link}
//               onClick={() => setActiveSubmenu(null)} // ← reset parent highlight
//             >
//               <span className="menu-icon flex-grow-0">
//                 <Icon icon={item.icon} />
//               </span>
//               <div className="text-box flex-grow">{item.title}</div>
//               {item.badge && <span className="menu-badge">{item.badge}</span>}
//             </NavLink>
//           )}

//           {/* Menu label */}
//           {item.isHeadr && !item.child && <div className="menulabel">{item.title}</div>}

//           {/* Parent with submenu */}
//           {item.child && (
//             <div
//               className={`menu-link cursor-pointer ${activeSubmenu === i ? "parent_active not-collapsed" : "collapsed"}`}
//             >
//               <div
//                 className="flex-1 flex items-start"
//                 onClick={() => handleParentClick(i, item.link)}
//               >
//                 <span className="menu-icon">
//                   <Icon icon={item.icon} />
//                 </span>
//                 <div className="text-box">{item.title}</div>
//               </div>

//               {/* Arrow */}
//               <div
//                 className="flex-0 menu-arrow"
//                 onClick={() => toggleSubmenu(i)}
//               >
//                 <div className={`transform transition-all duration-300 ${activeSubmenu === i ? "rotate-90" : ""}`}>
//                   <Icon icon="heroicons-outline:chevron-right" />
//                 </div>
//               </div>
//             </div>
//           )}

//           <Submenu
//             activeSubmenu={activeSubmenu}
//             item={item}
//             i={i}
//             toggleMultiMenu={toggleMultiMenu}
//             activeMultiMenu={activeMultiMenu}
//           />
//         </li>
//       ))}
//     </ul>
//   );
// };

// export default Navmenu;


import React, { useEffect, useState, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/Icon";
import { toggleActiveChat } from "@/pages/app/chat/store";
import { useDispatch, useSelector } from "react-redux";
import useMobileMenu from "@/hooks/useMobileMenu";
import Submenu from "./Submenu";

const Navmenu = ({ menus, collapsed }) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [activeMultiMenu, setMultiMenu] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const locationName = location.pathname.replace(/^\//, "");
  const [mobileMenu, setMobileMenu] = useMobileMenu();
  const navigate = useNavigate();

  const toggleSubmenu = (i) => {
    setActiveSubmenu(activeSubmenu === i ? null : i);
  };

  const toggleMultiMenu = (j) => {
    setMultiMenu(activeMultiMenu === j ? null : j);
  };

  // Normalize path for comparison (removes trailing slashes, converts to lowercase)
  const normalizePath = (path) => {
    if (!path) return "";
    return path.replace(/\/$/, "").toLowerCase();
  };

  // Check if current location exactly matches the target
  const isExactMatch = (targetLocation) => {
    if (!targetLocation || targetLocation.trim() === "") return false;
    return normalizePath(locationName) === normalizePath(targetLocation);
  };

  // Check if current location is a child route of the target
  const isChildRoute = (targetLocation) => {
    if (!targetLocation || targetLocation.trim() === "") return false;

    const current = normalizePath(locationName);
    const target = normalizePath(targetLocation);

    // Ensure we're doing a proper path segment match, not substring match
    if (current === target) return false; // This is exact match, not child

    // Check if current starts with target/ (with slash separator)
    return current.startsWith(target + "/");
  };

  // FILTER MENUS - moved to useMemo for reusability
  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      if (user?.type === "company") {
        return (
          menu.link !== "Sector-table" &&
          menu.link !== "Industry" &&
          menu.link !== "Company"
        );
      } else if (user?.type === "admin") {
        return (
          menu.link === "Sector-table" ||
          menu.link === "Industry" ||
          menu.link === "Company"
        );
      } else if (user?.type === "user") {
        return (
          menu.title === "Venue" ||
          menu.title === "Booking" ||
          menu.title === "Rider"
        );
      }
      return false;
    });
  }, [menus, user?.type]);

  useEffect(() => {
    let submenuIndex = null;
    let multiMenuIndex = null;
    let matchFound = false;

    // Iterate through FILTERED menus to ensure index alignment
    for (let i = 0; i < filteredMenus.length; i++) {
      const item = filteredMenus[i];

      // Skip if already found a match
      if (matchFound) break;

      // PRIORITY 1: Check children first (more specific routes)
      if (item.child && item.child.length > 0) {
        for (let j = 0; j < item.child.length; j++) {
          const childItem = item.child[j];

          // Check child link match
          if (
            isExactMatch(childItem.childlink) ||
            isChildRoute(childItem.childlink)
          ) {
            submenuIndex = i;
            multiMenuIndex = null;
            matchFound = true;
            break;
          }

          // Check multi-menu items
          if (childItem.multi_menu && childItem.multi_menu.length > 0) {
            for (let k = 0; k < childItem.multi_menu.length; k++) {
              const nested = childItem.multi_menu[k];

              if (
                isExactMatch(nested.multiLink) ||
                isChildRoute(nested.multiLink)
              ) {
                submenuIndex = i;
                multiMenuIndex = j;
                matchFound = true;
                break;
              }
            }
            if (matchFound) break;
          }
        }
      }

      // PRIORITY 2: Check parent link match (only if no child matched)
      if (!matchFound && item.link) {
        // For parent items WITH children: only exact match activates parent
        if (item.child && item.child.length > 0) {
          if (isExactMatch(item.link)) {
            submenuIndex = i;
            matchFound = true;
          }
        }
        // For parent items WITHOUT children: exact or child route match
        else {
          if (isExactMatch(item.link) || isChildRoute(item.link)) {
            submenuIndex = i;
            matchFound = true;
          }
        }
      }
    }

    setActiveSubmenu(submenuIndex);
    setMultiMenu(multiMenuIndex);

    dispatch(toggleActiveChat(false));
    if (mobileMenu) setMobileMenu(false);
  }, [location.pathname, filteredMenus]);

  const handleParentClick = (i, link) => {
    toggleSubmenu(i);

    setTimeout(() => {
      navigate(link);
    }, 100);
  };

  return (
    <ul className="space-y-1">
      {filteredMenus.map((item, i) => (
        <li
          key={i}
          className={`
        sidebar-menu-item 
        ${item.child ? "has-children" : ""} 
        ${activeSubmenu === i ? "expanded" : ""} 
        ${locationName === item.link ? "active" : ""}
        ${item.isHeadr ? "menu-header" : ""}
      `}
        >
          {/* Menu Label/Header - Hide when collapsed */}
          {item.isHeadr && !item.child && (
            <div className={`px-4 py-2 mt-2 mb-1 transition-all duration-200 ${collapsed ? "opacity-0 invisible" : "opacity-100 visible"}`}>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                {item.title}
              </span>
            </div>
          )}

          {/* Single menu - no child */}
          {!item.child && !item.isHeadr && (
            <NavLink
              className={({ isActive }) => `
            menu-link group relative flex items-center gap-3 px-4 py-2.5 rounded-xl
            transition-all duration-200 ease-in-out
            ${collapsed ? "justify-center mx-1" : "mx-2"}
            ${isActive || locationName === item.link
                  ? "btn-dark shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
          `}
              to={item.link}
              onClick={() => setActiveSubmenu(null)}
            >
              {/* Active Indicator - Adjust for collapsed mode */}
              {(locationName === item.link) && (
                <div className={`absolute left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full transition-all duration-200 ${collapsed ? "left-0" : ""}`}></div>
              )}

              {/* Icon - Centered when collapsed */}
              <span className={`
            menu-icon flex-shrink-0 transition-all duration-200
            ${collapsed ? "mx-auto" : ""}
            ${locationName === item.link ? "text-white" : "text-gray-400 group-hover:text-gray-600"}
          `}>
                <Icon icon={item.icon} width="20" height="20" />
              </span>

              {/* Title - Hide when collapsed */}
              <span className={`
            text-box flex-1 text-sm font-medium transition-all duration-200
            ${collapsed ? "hidden w-0" : "block"}
          `}>
                {item.title}
              </span>

              {/* Badge - Adjust for collapsed mode */}
              {item.badge && (
                <span className={`
              menu-badge px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-600
              transition-all duration-200
              ${collapsed ? "absolute -top-1 -right-1 scale-75" : ""}
            `}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          )}

          {/* Parent with submenu */}
          {item.child && (
            <div className="relative">
              <div
                className={`
              menu-link group relative flex items-center justify-between
              px-4 py-2.5 rounded-xl transition-all duration-200 ease-in-out cursor-pointer
              ${collapsed ? "justify-center mx-1" : "mx-2"}
              ${activeSubmenu === i
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
            `}
              >
                {/* Main content area */}
                <div
                  className={`
                flex items-center gap-3
                ${collapsed ? "justify-center w-full" : "flex-1"}
              `}
                  onClick={() => handleParentClick(i, item.link)}
                >
                  {/* Icon - Centered when collapsed */}
                  <span className={`
                menu-icon flex-shrink-0 transition-colors duration-200
                ${collapsed ? "mx-auto" : ""}
                ${activeSubmenu === i ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}
              `}>
                    <Icon icon={item.icon} width="20" height="20" />
                  </span>

                  {/* Title - Hide when collapsed */}
                  <span className={`
                text-box text-sm font-medium transition-all duration-200
                ${collapsed ? "hidden w-0" : "flex-1"}
              `}>
                    {item.title}
                  </span>
                </div>

                {/* Arrow - Hide when collapsed */}
                {!collapsed && (
                  <div
                    className="menu-arrow flex-shrink-0 ml-2 p-1 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSubmenu(i)}
                  >
                    <div
                      className={`transform transition-all duration-300 ease-in-out ${activeSubmenu === i ? "rotate-90" : ""
                        }`}
                    >
                      <Icon icon="heroicons-outline:chevron-right" width="16" height="16" />
                    </div>
                  </div>
                )}
              </div>

              {/* Submenu - Hide when collapsed */}
              {!collapsed && (
                <Submenu
                  activeSubmenu={activeSubmenu}
                  item={item}
                  i={i}
                  toggleMultiMenu={toggleMultiMenu}
                  activeMultiMenu={activeMultiMenu}
                />
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default Navmenu;