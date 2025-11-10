// import React, { useEffect, useState } from "react";
// import { NavLink, useLocation } from "react-router-dom";
// import { Collapse } from "react-collapse";
// import Icon from "@/components/ui/Icon";
// import { toggleActiveChat } from "@/pages/app/chat/store";
// import { useDispatch } from "react-redux";
// import useMobileMenu from "@/hooks/useMobileMenu";
// import Submenu from "./Submenu";
// import { useSelector } from "react-redux";

// const Navmenu = ({ menus }) => {
//   const [activeSubmenu, setActiveSubmenu] = useState(null);
//   const user = useSelector((state) => state.auth.user);

//   const toggleSubmenu = (i) => {
//     if (activeSubmenu === i) {
//       setActiveSubmenu(null);
//     } else {
//       setActiveSubmenu(i);
//     }
//   };

//   const location = useLocation();
//   const locationName = location.pathname.replace("/", "");
//   const [mobileMenu, setMobileMenu] = useMobileMenu();
//   const [activeMultiMenu, setMultiMenu] = useState(null);
//   const dispatch = useDispatch();

//   const toggleMultiMenu = (j) => {
//     if (activeMultiMenu === j) {
//       setMultiMenu(null);
//     } else {
//       setMultiMenu(j);
//     }
//   };

//   const isLocationMatch = (targetLocation) => {
//     return (
//       locationName === targetLocation ||
//       locationName.startsWith(`${targetLocation}/`)
//     );
//   };

//   useEffect(() => {
//     let submenuIndex = null;
//     let multiMenuIndex = null;
//     menus.forEach((item, i) => {
//       if (isLocationMatch(item.link)) {
//         submenuIndex = i;
//       }

//       if (item.child) {
//         item.child.forEach((childItem, j) => {
//           if (isLocationMatch(childItem.childlink)) {
//             submenuIndex = i;
//           }

//           if (childItem.multi_menu) {
//             childItem.multi_menu.forEach((nestedItem) => {
//               if (isLocationMatch(nestedItem.multiLink)) {
//                 submenuIndex = i;
//                 multiMenuIndex = j;
//               }
//             });
//           }
//         });
//       }
//     });
//     document.title = `SRP  | ${locationName}`;

//     setActiveSubmenu(submenuIndex);
//     setMultiMenu(multiMenuIndex);
//     dispatch(toggleActiveChat(false));
//     if (mobileMenu) {
//       setMobileMenu(false);
//     }
//   }, [location]);

//   // Filter menus based on user type
//   const filteredMenus = menus.filter((menu) => {
//     if (user?.type === "company") {
//       return menu.link !== "Sector-table" && menu.link !== "Industry" && menu.link !== "Company";
//     } else if (user?.type === "admin") {
//       // Show only Venue, Orders, and Rider for vendor
//       return (
//         menu.link === "Sector-table" ||
//         menu.link === "Industry" ||
//         menu.link === "Company"
//       );
//     } else if (user?.type === "user") {
//       // Show only Venue, Vendor, and Rider for regular users
//       return menu.title === "Venue" || menu.title === "Booking" || menu.title === "Rider";
//     }

//     return false;
//   });


//   return (
//     <>
//       <ul>
//         {filteredMenus.map((item, i) => (
//           <li
//             key={i}
//             className={`single-sidebar-menu 
//               ${item.child ? "item-has-children" : ""}
//               ${activeSubmenu === i ? "open" : ""}
//               ${locationName === item.link ? "menu-item-active" : ""}`}
//           >
//             {/* single menu with no children */}
//             {!item.child && !item.isHeadr && (
//               <NavLink className="menu-link" to={item.link}>
//                 <span className="menu-icon flex-grow-0">
//                   <Icon icon={item.icon} />
//                 </span>
//                 <div className="text-box flex-grow">{item.title}</div>
//                 {item.badge && <span className="menu-badge">{item.badge}</span>}
//               </NavLink>
//             )}
//             {/* only for menu label */}
//             {item.isHeadr && !item.child && (
//               <div className="menulabel">{item.title}</div>
//             )}
//             {/* !!sub menu parent */}
//             {/* {item.child && (
//               <div
//                 className={`menu-link cursor-pointer ${activeSubmenu === i
//                     ? "parent_active not-collapsed"
//                     : "collapsed"
//                   }`}
//               > */}
//             {/* Parent clickable link */}
//             {/* <NavLink
//                   to={item.link}
//                   className="flex-1 flex items-start"
//                   onClick={(e) => {
//                     e.stopPropagation(); // prevent toggling submenu
//                     setActiveSubmenu(i); // keep submenu open when navigating
//                   }}
//                 >
//                   <span className="menu-icon">
//                     <Icon icon={item.icon} />
//                   </span>
//                   <div className="text-box">{item.title}</div>
//                 </NavLink> */}

//             {/* Arrow icon for expanding submenu */}
//             {/* <div
//                   className="flex-0 menu-arrow"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     toggleSubmenu(i);
//                   }}
//                 >
//                   <div
//                     className={`transform transition-all duration-300 ${activeSubmenu === i ? "rotate-90" : ""
//                       }`}
//                   >
//                     <Icon icon="heroicons-outline:chevron-right" />
//                   </div>
//                 </div> */}
//             {item.child && (
//               <div
//                 className={`menu-link cursor-pointer ${activeSubmenu === i ? "parent_active not-collapsed" : "collapsed"}`}
//               >
//                 {/* Entire clickable area */}
//                 <div
//                   className="flex-1 flex items-start"
//                   onClick={() => toggleSubmenu(i)} // toggle submenu & rotate arrow
//                 >
//                   <span className="menu-icon">
//                     <Icon icon={item.icon} />
//                   </span>
//                   <div className="text-box">{item.title}</div>
//                 </div>

//                 {/* Arrow */}
//                 <div
//                   className="flex-0 menu-arrow"
//                   onClick={() => toggleSubmenu(i)} // also toggle submenu on arrow click
//                 >
//                   <div className={`transform transition-all duration-300 ${activeSubmenu === i ? "rotate-90" : ""}`}>
//                     <Icon icon="heroicons-outline:chevron-right" />
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* 
//               </div>
//             )} */}


//             <Submenu
//               activeSubmenu={activeSubmenu}
//               item={item}
//               i={i}
//               toggleMultiMenu={toggleMultiMenu}
//               activeMultiMenu={activeMultiMenu}
//             />
//           </li>
//         ))}
//       </ul>
//     </>
//   );
// };

// export default Navmenu;
import React, { useEffect, useState } from "react";
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
  const locationName = location.pathname.replace("/", "");
  const [mobileMenu, setMobileMenu] = useMobileMenu();
  const navigate = useNavigate();

  const toggleSubmenu = (i) => {
    setActiveSubmenu(activeSubmenu === i ? null : i);
  };

  const toggleMultiMenu = (j) => {
    setMultiMenu(activeMultiMenu === j ? null : j);
  };

  const isLocationMatch = (targetLocation) =>
    locationName === targetLocation || locationName.startsWith(`${targetLocation}/`);

  useEffect(() => {
    // Only update submenu if nothing is currently active
    if (activeSubmenu === null) {
      let submenuIndex = null;
      let multiMenuIndex = null;

      menus.forEach((item, i) => {
        if (isLocationMatch(item.link)) submenuIndex = i;

        if (item.child) {
          item.child.forEach((childItem, j) => {
            if (isLocationMatch(childItem.childlink)) submenuIndex = i;
            if (childItem.multi_menu) {
              childItem.multi_menu.forEach((nestedItem) => {
                if (isLocationMatch(nestedItem.multiLink)) {
                  submenuIndex = i;
                  multiMenuIndex = j;
                }
              });
            }
          });
        }
      });

      setActiveSubmenu(submenuIndex);
      setMultiMenu(multiMenuIndex);
    }

    dispatch(toggleActiveChat(false));
    if (mobileMenu) setMobileMenu(false);
  }, [location]);


  // Filter menus based on user type
  const filteredMenus = menus.filter((menu) => {
    if (user?.type === "company") {
      return menu.link !== "Sector-table" && menu.link !== "Industry" && menu.link !== "Company";
    } else if (user?.type === "admin") {
      return menu.link === "Sector-table" || menu.link === "Industry" || menu.link === "Company";
    } else if (user?.type === "user") {
      return menu.title === "Venue" || menu.title === "Booking" || menu.title === "Rider";
    }
    return false;
  });

  const handleParentClick = (i, link) => {
    toggleSubmenu(i); // toggle arrow/submenu

    // Navigate after a short delay to let React render the rotation
    setTimeout(() => {
      navigate(link);
    }, 100); // 100ms is enough
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
          {/* Single menu with no children */}
          {/* {!item.child && !item.isHeadr && (
            <NavLink className="menu-link" to={item.link}>
              <span className="menu-icon flex-grow-0">
                <Icon icon={item.icon} />
              </span>
              <div className="text-box flex-grow">{item.title}</div>
              {item.badge && <span className="menu-badge">{item.badge}</span>}
            </NavLink>
          )} */}
          {/* Single menu with no children */}
          {!item.child && !item.isHeadr && (
            <NavLink
              className="menu-link"
              to={item.link}
              onClick={() => setActiveSubmenu(null)} // ← reset parent highlight
            >
              <span className="menu-icon flex-grow-0">
                <Icon icon={item.icon} />
              </span>
              <div className="text-box flex-grow">{item.title}</div>
              {item.badge && <span className="menu-badge">{item.badge}</span>}
            </NavLink>
          )}


          {/* Menu label */}
          {item.isHeadr && !item.child && <div className="menulabel">{item.title}</div>}

          {/* Parent with submenu */}
          {item.child && (
            <div
              className={`menu-link cursor-pointer ${activeSubmenu === i ? "parent_active not-collapsed" : "collapsed"}`}
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

              {/* Arrow */}
              <div
                className="flex-0 menu-arrow"
                onClick={() => toggleSubmenu(i)}
              >
                <div className={`transform transition-all duration-300 ${activeSubmenu === i ? "rotate-90" : ""}`}>
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

