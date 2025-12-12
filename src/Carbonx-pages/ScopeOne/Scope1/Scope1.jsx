// import React from "react";
// import { useNavigate } from "react-router-dom";
// import Card from "@/components/ui/Card";

// const Scope1 = () => {
//   const navigate = useNavigate();

//   const categories = [
//     { title: "Stationary Combustion", path: "/Stationary-Combustion" },
//     { title: "Mobile Combustion", path: "/Mobile-Combustion" },
//     { title: "Fugitive Emissions", path: "/Fugitive-Emissions" },
//     { title: "Process Emissions", path: "/Process-Emissions" },
//   ];

//   return (
//     <div>
//       <div className="max-w-5xl mx-auto space-y-8">
//         {/* Header Section */}
//         <Card title={"Scope One: Direct GHG Emissions"} >
//           <p className="text-slate-700 leading-relaxed mb-6 bg-gray-100 p-2 rounded-lg border-l-4 border-primary-400">
//             Scope 1 includes direct GHG emissions from owned and leased facilities under the operational control of the organisation (e.g. offices / warehouses). These are emissions resulting from the combustion of fuels, refrigerant leakage and the use of selected industrial and shielding gases. They occur from sources that are owned or controlled by the company, for example, emissions from combustion in owned or controlled boilers, furnaces, vehicles, etc.; emissions from chemical production in owned or controlled process equipment.
//           </p>
//           <p className="text-slate-700 leading-relaxed mb-6 bg-gray-100 p-2 rounded-lg border-l-4 border-primary-400">
//             <span className="font-semibold ">
//               Note:
//             </span>{" "}
//             Direct CO₂ emissions from the combustion of biomass shall not be included in scope 1 but reported separately.
//           </p>
//           {/* Sub-Task Cards Section */}
//           <label className="w-full font-extrabold text-2xl text-slate-700 pb-8 text-center">
//             SCOPE 1 CATEGORIES
//           </label>
//           <div className="grid sm:grid-cols-4 gap-10 pl-20 pr-20 pb-10">
//             {categories.map((cat, index) => (
//               <div
//                 key={index}
//                 onClick={() => navigate(cat.path)}
//                 className="h-40 flex items-center justify-center rounded-xl border  border-white   shadow-md hover:shadow-lg hover:scale-[1.05] transition-all  duration-300 bg-slate-50 hover:bg-gradient-to-r from-[#bcebdd] to-[#c6e4ebac] cursor-pointer"
//               >
//                 <h3 className="text-lg font-semibold text-center text-slate-600 hover:text-white p-10 ">{cat.title}</h3>
//               </div>
//             ))}
//           </div>
//         </Card>

//       </div>
//     </div>
//   );
// };

// export default Scope1;
import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import { Icon } from "@iconify/react";

const Scope1 = () => {
  const navigate = useNavigate();

  const categories = [
    { 
      title: "Stationary Combustion", 
      path: "/Stationary-Combustion",
      icon: "heroicons:fire", 
      bg: "bg-cyan-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#bcebdd] to-[#6fceba]"
    },
    { 
      title: "Mobile Combustion", 
      path: "/Mobile-Combustion",
      icon: "heroicons:truck", 
      bg: "bg-red-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#f6baba] to-[#f77878]"
    },
    { 
      title: "Fugitive Emissions", 
      path: "/Fugitive-Emissions",
      icon: "heroicons:cloud", 
      bg: "bg-purple-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#d8bbf7] to-[#a66ee0]"
    },
    { 
      title: "Process Emissions", 
      path: "/Process-Emissions",
      icon: "heroicons:cog-6-tooth", 
      bg: "bg-green-50",
      hoverGradient: "hover:bg-gradient-to-r from-[#bcebc0] to-[#6fcf97]"
    },
  ];

  return (
  <div className="w-full">
  <Card
    title={"Scope 1: Direct GHG Emissions"}
    className="w-full  flex flex-col justify-center pb-44 min-h-screen"
  >
    {/* <div className="max-w-5xl  mx-auto min-h-screen w-full space-y-8"> */}
      <div className="space-y-6 w-full">


      {/* Description */}
      <p className="text-slate-700 leading-relaxed bg-gray-100 p-2 rounded-lg border-l-4 border-primary-400">
        Scope 1 includes direct GHG emissions from owned and leased facilities 
        under the operational control of the organisation (e.g. offices / warehouses).
        These are emissions resulting from the combustion of fuels, refrigerant 
        leakage and the use of selected industrial and shielding gases.
      </p>

      <p className="text-slate-700 leading-relaxed bg-gray-100 p-2 rounded-lg border-l-4 border-primary-400">
        <span className="font-semibold">Note:</span>  
        Direct CO₂ emissions from the combustion of biomass shall not be included 
        in scope 1 but reported separately.
      </p>

      {/* Sub-Task Cards Section */}
      <label className="w-full font-extrabold text-2xl text-slate-700 text-center block">
        SCOPE 1 CATEGORIES
      </label>

      <div className="grid sm:grid-cols-4 gap-10  pb-10">
        {categories.map((cat, index) => (
          <div
            key={index}
            onClick={() => navigate(cat.path)}
            className={`h-40 flex flex-col items-center justify-center rounded-xl shadow-md hover:shadow-lg hover:scale-[1.05] transition-all duration-300 cursor-pointer ${cat.bg} ${cat.hoverGradient}`}
          >
            <Icon icon={cat.icon} className="text-4xl mb-3 text-gray-700" />
            <h3 className="text-lg font-semibold text-center text-gray-700">
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

export default Scope1;
