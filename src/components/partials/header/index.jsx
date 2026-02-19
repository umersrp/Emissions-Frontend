// import React from "react";
// import Icon from "@/components/ui/Icon";
// import SwitchDark from "./Tools/SwitchDark";
// import HorizentalMenu from "./Tools/HorizentalMenu";
// import useWidth from "@/hooks/useWidth";
// import useSidebar from "@/hooks/useSidebar";
// import useNavbarType from "@/hooks/useNavbarType";
// import useMenulayout from "@/hooks/useMenulayout";
// import useSkin from "@/hooks/useSkin";
// import Logo from "./Tools/Logo";
// import SearchModal from "./Tools/SearchModal";
// import Profile from "./Tools/Profile";
// import Notification from "./Tools/Notification";
// import Message from "./Tools/Message";
// import Language from "./Tools/Language";
// import useRtl from "@/hooks/useRtl";
// import useMobileMenu from "@/hooks/useMobileMenu";
// import MonoChrome from "./Tools/MonoChrome";
// import HeaderCart from "./Tools/cart";

// const Header = ({ className = "custom-class" }) => {
//   const [collapsed, setMenuCollapsed] = useSidebar();
//   const { width, breakpoints } = useWidth();
//   const [navbarType] = useNavbarType();
//   const navbarTypeClass = () => {
//     switch (navbarType) {
//       case "floating":
//         return "floating  has-sticky-header";
//       case "sticky":
//         return "sticky top-0 z-[999]";
//       case "static":
//         return "static";
//       case "hidden":
//         return "hidden";
//       default:
//         return "sticky top-0";
//     }
//   };
//   const [menuType] = useMenulayout();
//   const [skin] = useSkin();
//   const [isRtl] = useRtl();

//   const [mobileMenu, setMobileMenu] = useMobileMenu();

//   const handleOpenMobileMenu = () => {
//     setMobileMenu(!mobileMenu);
//   };

//   const borderSwicthClass = () => {
//     if (skin === "bordered" && navbarType !== "floating") {
//       return "border-b border-slate-200 dark:border-slate-700";
//     } else if (skin === "bordered" && navbarType === "floating") {
//       return "border border-slate-200 dark:border-slate-700";
//     } else {
//       return "dark:border-b dark:border-slate-700 dark:border-opacity-60";
//     }
//   };
//   return (
//     <header className={className + " " + navbarTypeClass()}>
//       <div
//         className={` app-header md:px-6 px-[15px]  dark:bg-slate-800 shadow-base dark:shadow-base3 bg-white
//         ${borderSwicthClass()}
//              ${
//                menuType === "horizontal" && width > breakpoints.xl
//                  ? "py-1"
//                  : "md:py-6 py-3"
//              }
//         `}
//       >
//         <div className="flex justify-between items-center h-full w-full ">
//           {/* For Vertical  */}

//         {menuType === "vertical" && (
//   <div className="flex items-center md:space-x-4 space-x-2 rtl:space-x-reverse">
//     {/* Show arrow button on all screens when sidebar is collapsed */}
//     {collapsed && (
//       <button
//         className="text-xl text-slate-900 dark:text-white"
//         onClick={() => setMenuCollapsed(!collapsed)}
//       >
//         {isRtl ? (
//           <Icon icon="akar-icons:arrow-left" />
//         ) : (
//           <Icon icon="akar-icons:arrow-right" />
//         )}
//       </button>
//     )}
    
//     {/* open mobile menu handler - only show when sidebar is NOT collapsed */}
//     {!collapsed && width < breakpoints.xl && width >= breakpoints.md && (
//       <div
//         className="cursor-pointer text-slate-900 dark:text-white text-2xl"
//         onClick={handleOpenMobileMenu}
//       >
//         <Icon icon="heroicons-outline:menu-alt-3" />
//       </div>
//     )}
//     {/* <SearchModal /> */}
//   </div>
// )}
//           {/* For Horizontal  */}
//           {menuType === "horizontal" && (
//             <div className="flex items-center space-x-4 ">
//               {/* <Logo /> */}
//               {/* open mobile menu handlaer*/}
//               {width > breakpoints.md && width <= breakpoints.xl && (
//                 <div
//                   className="cursor-pointer text-slate-900 dark:text-white text-2xl"
//                   onClick={handleOpenMobileMenu}
//                 >
//                   <Icon icon="heroicons-outline:menu-alt-3" />
//                 </div>
//               )}
//             </div>
//           )}
//           {/*  Horizontal  Main Menu */}
//           {menuType === "horizontal" && width >= breakpoints.xl ? (
//             <HorizentalMenu />
//           ) : null}
//           {/* Nav Tools  */}
//           <div className="nav-tools flex items-center md:space-x-6 space-x-3 rtl:space-x-reverse">
//             {/* <Language />
//             <SwitchDark />
//             <MonoChrome />
//             <HeaderCart />
//             {width >= breakpoints.md && <Message />}
//             {width >= breakpoints.md && <Notification />} */}
//             {width >= breakpoints.md && <Profile />}
//             {width <= breakpoints.md && (
//               <div
//                 className="cursor-pointer text-slate-900 dark:text-white text-2xl"
//                 onClick={handleOpenMobileMenu}
//               >
//                 <Icon icon="heroicons-outline:menu-alt-3" />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

import React from "react";
import Icon from "@/components/ui/Icon";
import HorizentalMenu from "./Tools/HorizentalMenu";
import useWidth from "@/hooks/useWidth";
import useSidebar from "@/hooks/useSidebar";
import useNavbarType from "@/hooks/useNavbarType";
import useMenulayout from "@/hooks/useMenulayout";
import useSkin from "@/hooks/useSkin";
import Profile from "./Tools/Profile";
import useRtl from "@/hooks/useRtl";
import useMobileMenu from "@/hooks/useMobileMenu";

const Header = ({ className = "custom-class" }) => {
  const [collapsed, setMenuCollapsed] = useSidebar();
  const { width, breakpoints } = useWidth();
  const [navbarType] = useNavbarType();
  const [menuType] = useMenulayout();
  const [skin] = useSkin();
  const [isRtl] = useRtl();
  const [mobileMenu, setMobileMenu] = useMobileMenu();

  const handleOpenMobileMenu = () => {
    setMobileMenu(!mobileMenu);
  };

  const navbarTypeClass = () => {
    switch (navbarType) {
      case "floating":
        return "floating has-sticky-header";
      case "sticky":
        return "sticky top-0 z-[999]";
      case "static":
        return "static";
      case "hidden":
        return "hidden";
      default:
        return "sticky top-0";
    }
  };

  const borderSwicthClass = () => {
    if (skin === "bordered" && navbarType !== "floating") {
      return "border-b border-slate-200 dark:border-slate-700";
    } else if (skin === "bordered" && navbarType === "floating") {
      return "border border-slate-200 dark:border-slate-700";
    } else {
      return "dark:border-b dark:border-slate-700 dark:border-opacity-60";
    }
  };

  return (
    <header className={className + " " + navbarTypeClass()}>
      <div
        className={`app-header md:px-6 px-[15px] dark:bg-slate-800 shadow-base dark:shadow-base3 bg-white
        ${borderSwicthClass()}
        ${
          menuType === "horizontal" && width > breakpoints.xl
            ? "py-1"
            : "md:py-6 py-3"
        }
        `}
      >
        <div className="flex justify-between items-center h-full w-full">
          {/* For Vertical */}
          {menuType === "vertical" && (
            <div className="flex items-center md:space-x-4 space-x-2 rtl:space-x-reverse">
              {/* Show arrow button on xl screens when collapsed */}
              {width >= breakpoints.xl && collapsed && (
                <button
                  className="text-xl text-slate-900 dark:text-white"
                  onClick={() => setMenuCollapsed(!collapsed)}
                >
                  {isRtl ? (
                    <Icon icon="akar-icons:arrow-left" />
                  ) : (
                    <Icon icon="akar-icons:arrow-right" />
                  )}
                </button>
              )}
              
              {/* Show arrow button on screens below xl when sidebar is collapsed (via mobile menu) */}
              {width < breakpoints.xl && (
                <button
                  className="text-xl text-slate-900 dark:text-white"
                  onClick={handleOpenMobileMenu}
                >
                  <Icon icon="heroicons-outline:menu-alt-3" />
                </button>
              )}
            </div>
          )}

          {/* For Horizontal */}
          {menuType === "horizontal" && (
            <div className="flex items-center space-x-4">
              {width > breakpoints.md && width <= breakpoints.xl && (
                <div
                  className="cursor-pointer text-slate-900 dark:text-white text-2xl"
                  onClick={handleOpenMobileMenu}
                >
                  <Icon icon="heroicons-outline:menu-alt-3" />
                </div>
              )}
            </div>
          )}

          {/* Horizontal Main Menu */}
          {menuType === "horizontal" && width >= breakpoints.xl ? (
            <HorizentalMenu />
          ) : null}

          {/* Nav Tools */}
          <div className="nav-tools flex items-center md:space-x-6 space-x-3 rtl:space-x-reverse">
            {width >= breakpoints.md && <Profile />}
            {width <= breakpoints.md && (
              <div
                className="cursor-pointer text-slate-900 dark:text-white text-2xl"
                onClick={handleOpenMobileMenu}
              >
                <Icon icon="heroicons-outline:menu-alt-3" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

