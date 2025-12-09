
import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";

const Scope3 = () => {
  const navigate = useNavigate();

  const upstream_categories = [
    {
      title: "Purchased Good & Services",
      path: "/Purchased-Good-Services",
      icon: "heroicons:shopping-bag",
      bg: "bg-cyan-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#bcebdd] to-[#6fceba]"
    },
    {
      title: "Capital Goods",
      path: "",
      icon: "heroicons:building-office",
      bg: "bg-red-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#f6baba] to-[#f77878]"
    },
    {
      title: "Fuel and Energy Related Activities",
      path: "/fuel-energy",
      icon: "heroicons:bolt",
      bg: "bg-purple-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#d8bbf7] to-[#a66ee0]"
    },
    {
      title: "Upstream Transportation & Distribution",
      path: "",
      icon: "heroicons:truck",
      bg: "bg-green-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#bcebc0] to-[#6fcf97]"
    },

    {
      title: "Waste Generated in Operations",
      path: "",
      icon: "heroicons:trash",
      bg: "bg-yellow-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#fdf3b7] to-[#f5d742]"
    },
    {
      title: "Business Travel",
      path: "",
      icon: "heroicons:briefcase",
      bg: "bg-blue-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#c6dcff] to-[#7fb3ff]"
    },
    {
      title: "Employee Commuting",
      path: "",
      icon: "heroicons:user-group",
      bg: "bg-amber-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#fcc7d8] to-[#f56b8b]"
    },
    {
      title: "Upstream Leased Assets",
      path: "",
      icon: "heroicons:building-library",
      bg: "bg-stone-100",
      hoverGradient: "hover:bg-gradient-to-r from-[#ffd7b0] to-[#ff9f45]"
    },
  ];

  const downstream_categories = [
    {
      title: "Downstream Transportation & Distribution",
      path: "",
      icon: "heroicons:fire",
      bg: "bg-cyan-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#bcebdd] to-[#6fceba]"
    },
    {
      title: "Processing of Sold Products",
      path: "",
      icon: "heroicons:truck",
      bg: "bg-red-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#f6baba] to-[#f77878]"
    },
    {
      title: "Use of Sold Products",
      path: "",
      icon: "heroicons:cloud",
      bg: "bg-purple-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#d8bbf7] to-[#a66ee0]"
    },
    {
      title: "End-of-Life Treatment of Sold Products",
      path: "",
      icon: "heroicons:cog-6-tooth",
      bg: "bg-green-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#bcebc0] to-[#6fcf97]"
    },
    {
      title: "Downstream Leased Assets",
      path: "",
      icon: "heroicons:fire",
      bg: "bg-cyan-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#bcebdd] to-[#6fceba]"
    },
    {
      title: "Franchises",
      path: "",
      icon: "heroicons:truck",
      bg: "bg-red-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#f6baba] to-[#f77878]"
    },
    {
      title: " Investments",
      path: "",
      icon: "heroicons:cloud",
      bg: "bg-purple-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#d8bbf7] to-[#a66ee0]"
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <Card title={"Scope 3: Direct GHG Emissions"}>
        <p className="text-slate-700 leading-relaxed mb-6 bg-gray-100 p-2 rounded-lg border-l-4 border-primary-400">
          Scope 3 emissions are a consequence of the activities of the company, but occur from sources not owned or controlled by the company, it refers to indirect greenhouse gas emissions from a company's value chain that are not owned or controlled by the company itself. This broad category includes emissions from activities such as the production of purchased goods and services, employee commuting, business travel, and the use and disposal of sold products.
        </p>
        {/* <p className="text-slate-700 leading-relaxed mb-6 bg-gray-100 p-2 rounded-lg border-l-4 border-primary-400">
          <span className="font-semibold ">Note:</span> Direct CO₂ emissions from the combustion of biomass shall not be included in scope 1 but reported separately.
        </p> */}

        {/*Upstream Categories */}
        <label className="w-full font-extrabold text-2xl text-slate-700 pb-8 text-center">
          Upstream Categories
        </label>
        <div className="grid sm:grid-cols-4 gap-10 pl-10 pr-10 pb-10">
          {upstream_categories.map((cat, index) => (
            <div
              key={index}
              onClick={() => navigate(cat.path)}
              className={`h-40 flex flex-col items-center justify-center rounded-xl shadow-md hover:shadow-lg hover:scale-[1.05] transition-all duration-300 cursor-pointer ${cat.bg} ${cat.hoverGradient}`}
            >
              <Icon icon={cat.icon} className="text-4xl mb-3 text-gray-700 hover:text-white" />
              <h3 className="text-lg font-semibold text-center text-gray-700 hover:text-white">
                {cat.title}
              </h3>
            </div>
          ))}
        </div>


        {/* Downstream Categories */}
        <label className="w-full font-extrabold text-2xl text-slate-700 pb-8 text-center">
          Downstream Categories
        </label>
        <div className="grid sm:grid-cols-4 gap-10 pl-10 pr-10 pb-10">
          {downstream_categories.map((cat, index) => (
            <div
              key={index}
              onClick={() => navigate(cat.path)}
              className={`h-40 flex flex-col items-center justify-center rounded-xl shadow-md hover:shadow-lg hover:scale-[1.05] transition-all duration-300 cursor-pointer ${cat.bg} ${cat.hoverGradient}`}
            >
              <Icon icon={cat.icon} className="text-4xl mb-3 text-gray-700 hover:text-white" />
              <h3 className="text-lg font-semibold text-center text-gray-700 hover:text-white">
                {cat.title}
              </h3>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Scope3;
