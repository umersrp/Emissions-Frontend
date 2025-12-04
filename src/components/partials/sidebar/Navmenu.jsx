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

const Navmenu = ({ menus }) => {
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
    <ul>
      {filteredMenus.map((item, i) => (
        <li
          key={i}
          className={`single-sidebar-menu 
            ${item.child ? "item-has-children" : ""} 
            ${activeSubmenu === i ? "open" : ""} 
            ${locationName === item.link ? "menu-item-active" : ""}`}
        >
          {/* Single menu no child */}
          {!item.child && !item.isHeadr && (
            <NavLink
              className="menu-link"
              to={item.link}
              onClick={() => setActiveSubmenu(null)}
            >
              <span className="menu-icon flex-grow-0">
                <Icon icon={item.icon} />
              </span>
              <div className="text-box flex-grow">{item.title}</div>
              {item.badge && <span className="menu-badge">{item.badge}</span>}
            </NavLink>
          )}

          {/* Menu Label */}
          {item.isHeadr && !item.child && (
            <div className="menulabel">{item.title}</div>
          )}

          {/* Parent with submenu */}
          {item.child && (
            <div
              className={`menu-link cursor-pointer ${
                activeSubmenu === i ? "parent_active not-collapsed" : "collapsed"
              }`}
            >
              <div
                className="flex-1 flex items-start"
                onClick={() => handleParentClick(i, item.link)}
              >
                <span className="menu-icon">
                  <Icon icon={item.icon} />
                </span>
                <div className="text-box">{item.title}</div>
              </div>

              <div className="flex-0 menu-arrow" onClick={() => toggleSubmenu(i)}>
                <div
                  className={`transform transition-all duration-300 ${
                    activeSubmenu === i ? "rotate-90" : ""
                  }`}
                >
                  <Icon icon="heroicons-outline:chevron-right" />
                </div>
              </div>
            </div>
          )}

          <Submenu
            activeSubmenu={activeSubmenu}
            item={item}
            i={i}
            toggleMultiMenu={toggleMultiMenu}
            activeMultiMenu={activeMultiMenu}
          />
        </li>
      ))}
    </ul>
  );
};

export default Navmenu;