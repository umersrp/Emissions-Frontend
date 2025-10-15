import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";

const Scope1 = () => {
  const navigate = useNavigate();

  const categories = [
    { title: "Stationary Combustion", path: "/Stationary-Combustion" },
    { title: "Mobile Combustion", path: "/scope1/mobile" },
    { title: "Fugitive Emissions", path: "/scope1/fugitive" },
    { title: "Process Emissions", path: "/scope1/process" },
  ];

  return (
    <div>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <Card title={"Scope 1: Direct GHG Emissions"}>
          <p className="text-slate-700 leading-relaxed mb-4">
            Scope 1 includes direct GHG emissions from owned and leased facilities under the operational control of the organisation (e.g. offices / warehouses). These are emissions resulting from the combustion of fuels, refrigerant leakage and the use of selected industrial and shielding gases. They occur from sources that are owned or controlled by the company, for example, emissions from combustion in owned or controlled boilers, furnaces, vehicles, etc.; emissions from chemical production in owned or controlled process equipment.
          </p>
          <p className="text-slate-700 leading-relaxed mb-6">
            <span className="font-semibold text-primary">
              Note:
            </span>{" "}
            Direct CO₂ emissions from the combustion of biomass shall not be included in scope 1 but reported separately.
          </p>
        </Card>

        {/* Sub-Task Cards Section */}
        <div className="grid sm:grid-cols-2 gap-6">
          {categories.map((cat, index) => (
            <div
              key={index}
              onClick={() => navigate(cat.path)}
              className="h-20 flex items-center justify-center rounded-2xl border border-gray-200 shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-300 bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-center text-white">{cat.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scope1;
