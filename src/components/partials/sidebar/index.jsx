import React, { useRef, useEffect, useState } from "react";
import SidebarLogo from "./Logo";
import Navmenu from "./Navmenu";
import { menuItems } from "@/constant/data";
import SimpleBar from "simplebar-react";
import useSidebar from "@/hooks/useSidebar";
import useSemiDark from "@/hooks/useSemiDark";
import useSkin from "@/hooks/useSkin";
import svgRabitImage from "@/assets/images/svg/rabit.svg";

const Sidebar = () => {
  const scrollableNodeRef = useRef(null);
  const [scroll, setScroll] = useState(false);

  // Sidebar collapsed state (global)
  const [collapsed, setMenuCollapsed] = useSidebar();

  // Hover + Pin states
  const [menuHover, setMenuHover] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (scrollableNodeRef.current?.scrollTop > 0) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };

    const node = scrollableNodeRef.current;
    node?.addEventListener("scroll", handleScroll);

    return () => node?.removeEventListener("scroll", handleScroll);
  }, []);

  // semi dark option
  const [isSemiDark] = useSemiDark();
  // skin
  const [skin] = useSkin();

  return (
    <div className={isSemiDark ? "dark" : ""}>
      <div
        className={`sidebar-wrapper bg-white dark:bg-slate-800
          ${collapsed ? "w-[72px] close_sidebar" : "w-[248px]"}
          ${menuHover ? "sidebar-hovered" : ""}
          ${
            skin === "bordered"
              ? "border-r border-slate-200 dark:border-slate-700"
              : "shadow-base"
          }
        `}
        onMouseEnter={() => {
          if (!isPinned) {
            setMenuCollapsed(false);
            setMenuHover(true);
          }
        }}
        onMouseLeave={() => {
          if (!isPinned) {
            setMenuCollapsed(true);
            setMenuHover(false);
          }
        }}
      >
        {/* Logo */}
        <SidebarLogo menuHover={menuHover} />

        {/* Pin / Unpin Button */}
        <button
          onClick={() => {
            setIsPinned((prev) => !prev);
            setMenuCollapsed(false);
          }}
          className="absolute top-4 right-3 z-50 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
        >
          {isPinned ? "«" : "»"}
        </button>

        {/* Shadow on scroll */}
        <div
          className={`h-[60px] absolute top-[80px] nav-shadow z-[1] w-full transition-all duration-200 pointer-events-none ${
            scroll ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Menu */}
        <SimpleBar
          className="sidebar-menu px-4 h-[calc(100%-80px)]"
          scrollableNodeProps={{ ref: scrollableNodeRef }}
        >
          <Navmenu menus={menuItems} />

          {/* Optional bottom upgrade card */}
          {/*
          {!collapsed && (
            <div className="bg-slate-900 mb-16 mt-24 p-4 relative text-center rounded-2xl text-white">
              <img
                src={svgRabitImage}
                alt=""
                className="mx-auto relative -mt-[73px]"
              />
              <div className="max-w-[160px] mx-auto mt-6">
                <div className="widget-title">Unlimited Access</div>
                <div className="text-xs font-light">
                  Upgrade your system to business plan
                </div>
              </div>
              <div className="mt-6">
                <button className="btn bg-white hover:bg-opacity-80 text-slate-900 btn-sm w-full block">
                  Upgrade
                </button>
              </div>
            </div>
          )}
          */}

          <div className="px-5 py-5" />
        </SimpleBar>
      </div>
    </div>
  );
};

export default Sidebar;
