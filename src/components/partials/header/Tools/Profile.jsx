import React from "react";
import Dropdown from "@/components/ui/Dropdown";
import Icon from "@/components/ui/Icon";
import { Menu, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "@/store/api/auth/authSlice";

import UserAvatar from "@/assets/images/all-img/user.png";

const profileLabel = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userType = user?.type || "User";

  return (
    <div className="flex items-center gap-3 p-1 rounded-full bg-white shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:shadow-md transition-all duration-200">
      {/* Avatar Section */}
      <div className="flex-shrink-0">
        <div className="lg:h-9 lg:w-9 h-8 w-8 rounded-full ring-2 ring-primary-500 dark:ring-primary-900/30 ring-offset-2 ring-offset-white dark:ring-offset-slate-800">
          <img
            src={UserAvatar}
            alt="User avatar"
            className="block w-full h-full object-cover rounded-full"
          />
        </div>
      </div>

      {/* User Type & Dropdown Section */}
      <div className="flex items-center gap-2 pr-2">
        <div className="bg-gradient-to-r from-[#2d6d74] to-[#094382] rounded-full shadow-sm hover:shadow-md transition-all duration-200">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-white text-sm font-semibold tracking-wide">
            <span className="max-w-[120px] truncate">
              {userType}
            </span>
          </span>
        </div>

        <button
          className="flex items-center justify-center w-6 h-6 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200 cursor-pointer"
          aria-label="Toggle dropdown"
        >
          <Icon
            icon="heroicons-outline:chevron-down"
            className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
          />
        </button>
      </div>
    </div>
  );
};



const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Retrieve user role from Redux store or local storage
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.type || 'user'; // Default to 'User' if role is undefined

  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    dispatch(logOut());
    navigate("/");
  };

  const ProfileMenu = [
    // ... your menu items
    {
      label: "Logout",
      icon: "heroicons-outline:login",
      action: () => {
        dispatch(handleLogout);
      },
    },
  ];

  return (
    <Dropdown label={profileLabel(userRole)} classMenuItems="w-[180px] top-[58px]">
      {ProfileMenu.map((item, index) => (
        <Menu.Item key={index}>
          {({ active }) => (
            <div
              onClick={() => item.action()}
              className={`${active
                ? "bg-slate-100 text-slate-900 dark:bg-slate-600 dark:text-slate-300 dark:bg-opacity-50"
                : "text-slate-600 dark:text-slate-300"
                } block     ${item.hasDivider
                  ? "border-t border-slate-100 dark:border-slate-700"
                  : ""
                }`}
            >
              <div className={`block cursor-pointer px-4 py-2`}>
                <div className="flex items-center">
                  <span className="block text-xl ltr:mr-3 rtl:ml-3">
                    <Icon icon={item.icon} />
                  </span>
                  <span className="block text-sm">{item.label}</span>
                </div>
              </div>
            </div>
          )}
        </Menu.Item>
      ))}
    </Dropdown>
  );
};


export default Profile;
