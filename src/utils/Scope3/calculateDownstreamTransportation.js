import { 
  soldGoodsEmissionFactors
} from "@/constant/scope3/downstreamTransportation";

export const calculateDownstreamTransportationEmission = (data) => {
  console.log("Starting downstream calculation with data:", JSON.stringify(data, null, 2));
  
  // Input validation
  if (!data || !data.transportationCategory) {
    console.warn(" No transportation category provided");
    return null;
  }

  let calculatedEmissionKgCo2e = 0;
  let calculationDetails = {};

  try {
    // Downstream only has "Sold Goods" category for calculation
    if (data.transportationCategory === "Sold Goods") {
      console.log(" Calculating for soldGoods");
      
      // Validate required fields
      if (!data.weightLoaded || !data.distanceTravelled || !data.transportationVehicleCategory) {
        console.warn(" Missing required fields for soldGoods calculation");
        return null;
      }

      const weight = parseFloat(data.weightLoaded);
      const distance = parseFloat(data.distanceTravelled);
      const vehicleCategory = data.transportationVehicleCategory;
      const vehicleType = data.transportationVehicleType;

      console.log(` Inputs: Weight=${weight} tonnes, Distance=${distance} km, VehicleCategory=${vehicleCategory}, VehicleType=${vehicleType}`);

      // Validate numeric inputs
      if (isNaN(weight) || weight <= 0) {
        console.warn(" Invalid weight loaded");
        return null;
      }
      if (isNaN(distance) || distance <= 0) {
        console.warn(" Invalid distance travelled");
        return null;
      }

      // Get emission factor
      let emissionFactor = 0;
      
      // Check if vehicle category requires sub-types (freightFlights, seaTanker, cargoShip)
      if (vehicleCategory === "freightFlights" || 
          vehicleCategory === "seaTanker" || 
          vehicleCategory === "cargoShip") {
        
        // Vehicles with sub-types
        if (!vehicleType) {
          console.warn(` Vehicle type required for ${vehicleCategory}`);
          return null;
        }
        
        const categoryFactors = soldGoodsEmissionFactors[vehicleCategory];
        if (!categoryFactors) {
          console.warn(` No emission factors found for ${vehicleCategory}`);
          return null;
        }
        
        emissionFactor = categoryFactors[vehicleType];
        if (!emissionFactor) {
          console.warn(` No emission factor found for ${vehicleCategory}.${vehicleType}`);
          return null;
        }
        
        console.log(` Using EF for ${vehicleCategory}.${vehicleType}: ${emissionFactor} kg CO2e/tonne-km`);
        
      } else {
        // Vehicles without sub-types (vans, hqv, hqvRefrigerated, rail)
        emissionFactor = soldGoodsEmissionFactors[vehicleCategory];
        if (!emissionFactor) {
          console.warn(` No emission factor found for ${vehicleCategory}`);
          return null;
        }
        
        console.log(` Using EF for ${vehicleCategory}: ${emissionFactor} kg CO2e/tonne-km`);
      }

      // Calculate emissions: weight (tonnes) × distance (km) × EF (kg CO2e/tonne-km)
      calculatedEmissionKgCo2e = weight * distance * emissionFactor;
      
      calculationDetails = {
        category: "Sold Goods",
        weight,
        distance,
        vehicleCategory,
        vehicleType,
        emissionFactor,
        formula: `(${weight} tonnes × ${distance} km × ${emissionFactor} kg CO2e/tonne-km)`,
        intermediateResult: weight * distance,
      };

    } else if (data.transportationCategory === "downstreamServices") {
      console.log("Downstream Services - No calculation needed (no emission factors provided)");
      // For downstreamServices, return null since no emission factors are provided
      return null;
      
    } else {
      console.warn(` Unknown transportation category: ${data.transportationCategory}`);
      return null;
    }

    // Convert to tonnes
    const calculatedEmissionTCo2e = calculatedEmissionKgCo2e / 1000;

    // Log detailed calculation
    console.log(" Calculation Details:", calculationDetails);
    console.log(` Calculated Emissions: ${calculatedEmissionKgCo2e.toFixed(4)} kg CO2e`);
    console.log(` Calculated Emissions: ${calculatedEmissionTCo2e.toFixed(6)} t CO2e`);

    const result = {
      calculatedEmissionKgCo2e: calculatedEmissionKgCo2e,
      calculatedEmissionTCo2e: calculatedEmissionTCo2e,
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
  return Object.keys(soldGoodsEmissionFactors).filter(
    key => typeof soldGoodsEmissionFactors[key] !== 'object'
  );
};

// Helper function to get vehicle types for a category
export const getVehicleTypesForCategory = (category) => {
  if (soldGoodsEmissionFactors[category] && 
      typeof soldGoodsEmissionFactors[category] === 'object') {
    return Object.keys(soldGoodsEmissionFactors[category]);
  }
  return [];
};