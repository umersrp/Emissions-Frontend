
import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";
import buildingIcon from "@/assets/images/icon/building.png";
import bulletTrainIcon from "@/assets/images/icon/bullet-train.png";
import cargoShipIcon from "@/assets/images/icon/cargo-ship.png";
import factoryIcon from "@/assets/images/icon/factory.png";
import twoTruckIcon from "@/assets/images/icon/tow-truck.png";
import charcoalIcon from "@/assets/images/icon/charcoal.png";
import garbageIcon from "@/assets/images/icon/garbage.png";
import planeIcon from "@/assets/images/icon/plane.png";
import lightIcon from "@/assets/images/icon/light.png";
import recycleBinIcon from "@/assets/images/icon/recycle-bin.png";




import { icon } from "leaflet";

const Scope3 = () => {
  const navigate = useNavigate();

  const upstream_categories = [
    {
      title: "Purchased Goods and Services",
      path: "/Purchased-Good-Services",
      // icon: "mdi:factory",
      icon: factoryIcon,
      iconType: "png",
      bg: "bg-cyan-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#bcebdd] to-[#6fceba]"
    },
    {
      title: "Capital Goods",
      path: "/Capital-Goods",
      // icon: "heroicons:cube-transparent",
      icon: twoTruckIcon,
      iconType: "png",
      bg: "bg-red-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#f6baba] to-[#f77878]"
    },
    {
      title: "Fuel and Energy Related Activities",
      path: "/fuel-energy",
      icon: charcoalIcon,
      iconType: "png",
      bg: "bg-purple-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#d8bbf7] to-[#a66ee0]"
    },
    {
      title: "Upstream Transportation & Distribution",
      path: "/Upstream-Transportation",
      // icon: "heroicons:arrow-down-tray",
      icon: cargoShipIcon,
      iconType: "png",
      bg: "bg-green-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#bcebc0] to-[#6fcf97]"
    },

    {
      title: "Waste Generated in Operations",
      path: "/Waste-Generated",
      icon: garbageIcon,
      iconType: "png",
      bg: "bg-yellow-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#fdf3b7] to-[#f5d742]"
    },
    {
      title: "Business Travel",
      path: "/Business-Travel",
      icon: planeIcon,
      iconType: "png",
      bg: "bg-blue-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#c6dcff] to-[#7fb3ff]"
    },
    {
      title: "Employee Commuting",
      path: "/Commuting",
      // icon: "heroicons:user-group",
      icon: bulletTrainIcon,
      iconType: "png",
      bg: "bg-amber-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#fcc7d8] to-[#f56b8b]"
    },
    {
      title: "Upstream Leased Assets",
      path: "",
      icon: buildingIcon,
      iconType: "png",
      bg: "bg-stone-100",
      hoverGradient: "hover:bg-gradient-to-r from-[#ffd7b0] to-[#ff9f45]"
    },
  ];

  const downstream_categories = [
    {
      title: "Downstream Transportation & Distribution",
      path: "/Downstream-Transportation",
      icon: cargoShipIcon,
      iconType: "png",
      bg: "bg-cyan-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#bcebdd] to-[#6fceba]"
    },
    {
      title: "Processing of Sold Products",
      path: "",
      icon: factoryIcon,
      iconType: "png",
      bg: "bg-red-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#f6baba] to-[#f77878]"
    },
    {
      title: "Use of Sold Products",
      path: "",
      icon: lightIcon,
      iconType: "png",
      bg: "bg-purple-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#d8bbf7] to-[#a66ee0]"
    },
    {
      title: "End-of-Life Treatment of Sold Products",
      path: "",
      icon: recycleBinIcon,
      iconType: "png",
      bg: "bg-green-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#bcebc0] to-[#6fcf97]"
    },
    {
      title: "Downstream Leased Assets",
      path: "",
      icon: buildingIcon,
      iconType: "png",
      bg: "bg-cyan-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#bcebdd] to-[#6fceba]"
    },
    {
      title: "Franchises",
      path: "",
      icon: "heroicons:building-storefront",
      iconType: "iconify",
      bg: "bg-red-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#f6baba] to-[#f77878]"
    },
    {
      title: " Investments",
      path: "",
      icon: "heroicons:banknotes",
      iconType: "iconify",
      bg: "bg-purple-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#d8bbf7] to-[#a66ee0]"
    },
  ];

  return (
    <div className="w-full">      {/* Header Section */}
      <Card title={"Scope 3: Direct GHG Emissions"}
        className="w-full  flex flex-col justify-center pb-44 min-h-screen">
        <div className="sm:space-y-2 2xl:space-y-6 w-full">
          <p className="text-slate-700 sm:text-[12px] 2xl:text-lg  leading-relaxed sm:mb-0 2xl:mb-6 bg-gray-100 p-2 rounded-lg border-l-4 border-primary-400">
            Scope 3 emissions are a consequence of the activities of the company, but occur from sources not owned or controlled by the company, it refers to indirect greenhouse gas emissions from a <span className="font-extrabold "> company's value chain</span> that are not owned or controlled by the company itself. This broad category includes emissions from activities such as the production of purchased goods and services, employee commuting, business travel, and the use and disposal of sold products.
          </p>

          {/*Upstream Categories */}
          {/* Upstream Categories */}
          <label className="w-full font-extrabold text-[14px] 2xl:text-lg text-slate-700 pt-2 2xl:pb-8 text-center block">
            Upstream Categories
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 2xl:gap-10 px-4 sm:px-10 pb-6 sm:pb-10">
            {upstream_categories.map((cat, index) => (
              <div
                key={index}
                onClick={() => navigate(cat.path)}
                className={`flex flex-col items-center justify-center rounded-xl shadow-md hover:shadow-lg hover:scale-[1.05] transition-all duration-300 cursor-pointer py-4 sm:py-5 2xl:py-8 px-2 ${cat.bg} ${cat.hoverGradient}`}
              >
                {cat.iconType === "png" ? (
                  <img
                    src={cat.icon}
                    alt={cat.title}
                    className="w-8 h-8 2xl:w-10 2xl:h-10 mb-2 2xl:mb-3 object-contain filter grayscale opacity-60 transition-all duration-300"
                  />
                ) : (
                  <Icon
                    icon={cat.icon}
                    className="text-3xl 2xl:text-4xl mb-2 2xl:mb-3 text-gray-700 hover:text-white"
                  />
                )}
                <h3 className="text-[11px] sm:text-[12px] 2xl:text-lg font-semibold text-center text-gray-700 hover:text-white px-2 leading-tight">
                  {cat.title}
                </h3>
              </div>
            ))}
          </div>

          {/* Downstream Categories */}
          <label className="w-full font-extrabold text-[14px] 2xl:text-lg text-slate-700 pt-2 2xl:pb-8 text-center block">
            Downstream Categories
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 2xl:gap-10 px-4 sm:px-10 pb-6 sm:pb-10">
            {downstream_categories.map((cat, index) => (
              <div
                key={index}
                onClick={() => navigate(cat.path)}
                className={`flex flex-col items-center justify-center rounded-xl shadow-md hover:shadow-lg hover:scale-[1.05] transition-all duration-300 cursor-pointer py-4 sm:py-5 2xl:py-8 px-2 ${cat.bg} ${cat.hoverGradient}`}
              >
                {cat.iconType === "png" ? (
                  <img
                    src={cat.icon}
                    alt={cat.title}
                    className="w-8 h-8 2xl:w-10 2xl:h-10 mb-2 2xl:mb-3 object-contain filter grayscale opacity-60 transition-all duration-300"
                  />
                ) : (
                  <Icon
                    icon={cat.icon}
                    className="text-3xl 2xl:text-4xl mb-2 2xl:mb-3 text-gray-700 hover:text-white"
                  />
                )}
                <h3 className="text-[11px] sm:text-[12px] 2xl:text-lg font-semibold text-center text-gray-700 hover:text-white px-2 leading-tight">
                  {cat.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Scope3;
