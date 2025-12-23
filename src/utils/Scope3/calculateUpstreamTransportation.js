import { 
  purchasedGoodsEmissionFactors, 
  purchasedServicesEmissionFactors,
  activityTypeToEFKey 
} from "@/constant/scope3/upstreamTransportation";

export const calculateUpstreamTransportationEmission = (data) => {
  console.log(" Starting calculation with data:", JSON.stringify(data, null, 2));
  
  // Input validation
  if (!data || !data.transportationCategory) {
    console.warn("❌ No transportation category provided");
    return null;
  }

  let calculatedEmissionKgCo2e = 0;
  let calculationDetails = {};

  try {
    if (data.transportationCategory === "purchasedGoods") {
      console.log("Calculating for purchasedGoods");
      
      // Validate required fields
      if (!data.weightLoaded || !data.distanceTravelled || !data.vehicleCategory) {
        console.warn("❌ Missing required fields for purchasedGoods calculation");
        return null;
      }

      const weight = parseFloat(data.weightLoaded);
      const distance = parseFloat(data.distanceTravelled);
      const vehicleCategory = data.vehicleCategory;
      const vehicleType = data.vehicleType;

      console.log(`Inputs: Weight=${weight} tonnes, Distance=${distance} km, VehicleCategory=${vehicleCategory}, VehicleType=${vehicleType}`);

      // Validate numeric inputs
      if (isNaN(weight) || weight <= 0) {
        console.warn("❌ Invalid weight loaded");
        return null;
      }
      if (isNaN(distance) || distance <= 0) {
        console.warn("❌ Invalid distance travelled");
        return null;
      }

      // Get emission factor
      let emissionFactor = 0;
      
      if (vehicleCategory === "freightFlights" || 
          vehicleCategory === "seaTanker" || 
          vehicleCategory === "cargoShip") {
        
        // Vehicles with sub-types
        if (!vehicleType) {
          console.warn(`❌ Vehicle type required for ${vehicleCategory}`);
          return null;
        }
        
        const categoryFactors = purchasedGoodsEmissionFactors[vehicleCategory];
        if (!categoryFactors) {
          console.warn(`❌ No emission factors found for ${vehicleCategory}`);
          return null;
        }
        
        emissionFactor = categoryFactors[vehicleType];
        if (!emissionFactor) {
          console.warn(`❌ No emission factor found for ${vehicleCategory}.${vehicleType}`);
          return null;
        }
        
        console.log(` Using EF for ${vehicleCategory}.${vehicleType}: ${emissionFactor} kg CO2e/tonne-km`);
        
      } else {
        // Vehicles without sub-types
        emissionFactor = purchasedGoodsEmissionFactors[vehicleCategory];
        if (!emissionFactor) {
          console.warn(`❌ No emission factor found for ${vehicleCategory}`);
          return null;
        }
        
        console.log(` Using EF for ${vehicleCategory}: ${emissionFactor} kg CO2e/tonne-km`);
      }

      // Calculate emissions: weight (tonnes) × distance (km) × EF (kg CO2e/tonne-km)
      calculatedEmissionKgCo2e = weight * distance * emissionFactor;
      
      calculationDetails = {
        category: "purchasedGoods",
        weight,
        distance,
        vehicleCategory,
        vehicleType,
        emissionFactor,
        formula: `(${weight} tonnes × ${distance} km × ${emissionFactor} kg CO2e/tonne-km)`,
        intermediateResult: weight * distance,
      };

    } else if (data.transportationCategory === "purchasedServices") {
      console.log(" Calculating for purchasedServices");
      
      // Validate required fields
      if (!data.amountSpent || !data.activityType) {
        console.warn("❌ Missing required fields for purchasedServices calculation");
        return null;
      }

      const amountSpent = parseFloat(data.amountSpent);
      const activityType = data.activityType;

      console.log(` Inputs: Amount Spent=${amountSpent} ${data.unit || 'USD'}, ActivityType=${activityType}`);

      // Validate numeric input
      if (isNaN(amountSpent) || amountSpent <= 0) {
        console.warn("❌ Invalid amount spent");
        return null;
      }

      // Get emission factor based on activityType
      // First check if we have a direct mapping
      const efKey = activityTypeToEFKey[activityType];
      let emissionFactor = 0;
      
      if (efKey) {
        emissionFactor = purchasedServicesEmissionFactors[efKey];
      } else {
        // Try direct lookup
        emissionFactor = purchasedServicesEmissionFactors[activityType];
      }
      
      if (!emissionFactor) {
        console.warn(`❌ No emission factor found for activityType: ${activityType}`);
        // Try to find by partial match
        const possibleKeys = Object.keys(purchasedServicesEmissionFactors).filter(key => 
          activityType.toLowerCase().includes(key.toLowerCase())
        );
        if (possibleKeys.length > 0) {
          emissionFactor = purchasedServicesEmissionFactors[possibleKeys[0]];
          console.log(` Using closest match: ${possibleKeys[0]}`);
        } else {
          return null;
        }
      }

      console.log(` Using EF for ${activityType}: ${emissionFactor} kg CO2e/${data.unit || 'USD'}`);

      // Calculate emissions: amount spent × EF
      calculatedEmissionKgCo2e = amountSpent * emissionFactor;
      
      calculationDetails = {
        category: "purchasedServices",
        amountSpent,
        activityType,
        emissionFactor,
        formula: `(${amountSpent} ${data.unit || 'USD'} × ${emissionFactor} kg CO2e/${data.unit || 'USD'})`,
      };

    } else {
      console.warn(`❌ Unknown transportation category: ${data.transportationCategory}`);
      return null;
    }

    // Convert to tonnes
    const calculatedEmissionTCo2e = calculatedEmissionKgCo2e / 1000;

    // Log detailed calculation
    console.log(" Calculation Details:", calculationDetails);
    console.log(`Calculated Emissions: ${calculatedEmissionKgCo2e.toFixed(4)} kg CO2e`);
    console.log(`Calculated Emissions: ${calculatedEmissionTCo2e.toFixed(6)} t CO2e`);

    // Format results (handle very small or large numbers)
    const formatNumber = (num) => {
      if (num === 0) return "0";
      if (Math.abs(num) < 0.0001 || Math.abs(num) >= 1e6) {
        return num.toExponential(4);
      }
      // Round to 6 decimal places for tCO2e, 2 for kgCO2e
      return num.toFixed(6);
    };

    const result = {
      calculatedEmissionKgCo2e: formatNumber(calculatedEmissionKgCo2e),
      calculatedEmissionTCo2e: formatNumber(calculatedEmissionTCo2e),
      _rawCalculation: {
        kgCO2e: calculatedEmissionKgCo2e,
        tCO2e: calculatedEmissionTCo2e,
        details: calculationDetails
      }
    };

    console.log(" Final Result:", result);
    return result;

  } catch (error) {
    console.error(" Calculation error:", error);
    return null;
  }
};

// Helper function to get all available vehicle categories
export const getAvailableVehicleCategories = () => {
  return Object.keys(purchasedGoodsEmissionFactors).filter(
    key => typeof purchasedGoodsEmissionFactors[key] !== 'object'
  );
};

// Helper function to get vehicle types for a category
export const getVehicleTypesForCategory = (category) => {
  if (purchasedGoodsEmissionFactors[category] && 
      typeof purchasedGoodsEmissionFactors[category] === 'object') {
    return Object.keys(purchasedGoodsEmissionFactors[category]);
  }
  return [];
};