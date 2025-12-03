
import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";

const Scope2 = () => {
  const navigate = useNavigate();

  const categories = [
    { 
      title: "Purchased Electricity", 
      path: "/Purchased-Electricity",
      icon: "heroicons:fire", 
      bg: "bg-cyan-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#bcebdd] to-[#6fceba]"
    },
    { 
      title: "Purchased Steam", 
      path: "/",
      icon: "heroicons:truck", 
      bg: "bg-red-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#f6baba] to-[#f77878]"
    },
    { 
      title: "Purchased Heating", 
      path: "/",
      icon: "heroicons:cloud", 
      bg: "bg-purple-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#d8bbf7] to-[#a66ee0]"
    },
    { 
      title: "Purchased Cooling", 
      path: "/",
      icon: "heroicons:cog-6-tooth", 
      bg: "bg-green-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#bcebc0] to-[#6fcf97]"
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <Card title={"Scope 2: Direct GHG Emissions"}>
        <p className="text-slate-700 leading-relaxed mb-6 bg-gray-100 p-2 rounded-lg border-l-4 border-primary-400">
         Scope 2 accounts for GHG emissions from the generation of purchased electricity, steam, heating and cooling or consumed by the company. Purchased energy is defined as electricity, steam, heating and cooling that is purchased or otherwise brought into the organizational boundary of the company. Scope 2 emissions physically occur at the facility.        </p>
        {/* <p className="text-slate-700 leading-relaxed mb-6 bg-gray-100 p-2 rounded-lg border-l-4 border-primary-400">
          <span className="font-semibold ">Note:</span> Direct CO₂ emissions from the combustion of biomass shall not be included in scope 1 but reported separately.
        </p> */}

        {/* Sub-Task Cards Section */}
        <label className="w-full font-extrabold text-2xl text-slate-700 pb-8 text-center">
          SCOPE 2 CATEGORIES
        </label>
        <div className="grid sm:grid-cols-4 gap-10 pl-10 pr-10 pb-10">
          {categories.map((cat, index) => (
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

export default Scope2;
