import {
  airTravelEmissionFactors,
  taxiEmissionFactors,
  busEmissionFactors,
  trainEmissionFactors,
  motorbikeEmissionFactors,
  carEmissionFactors,
} from "@/constant/scope3/businessTravel";

/** Constant EF */
const HOTEL_EF = 72.6; // kg CO2e per room-night

export const calculateBusinessTravel = (data) => {
  console.group("🚗 Business Travel Emission Calculation");

  if (!data) {
    console.warn("No data provided");
    console.groupEnd();
    return null;
  }

  console.log("Input Data:", data);

  let result1 = 0; // Air
  let result2 = 0; // Motorbike
  let result3 = 0; // Taxi
  let result4 = 0; // Bus
  let result5 = 0; // Train
  let result6 = 0; // Car
  let result7 = 0; // Hotel

  /* ==================== RESULT 1 – AIR ==================== */
  if (data.travelByAir) {
    console.group("✈️ Result 1 – Air Travel");

    const passengers = Number(data.airPassengers);
    const distance = Number(data.airDistanceKm);
    const flightType =
    typeof data.airFlightType === "object"
      ? data.airFlightType?.value
      : data.airFlightType;

  const travelClass =
    typeof data.airTravelClass === "object"
      ? data.airTravelClass?.value
      : data.airTravelClass;

    const factor =
      airTravelEmissionFactors?.[flightType]?.[travelClass] || 0;

    result1 = passengers * distance * factor;

    console.log({
      passengers,
      distance,
      flightType,
      travelClass,
      factor,
      result1,
    });

    console.groupEnd();
  }

  /* ==================== RESULT 2 – MOTORBIKE ==================== */
  if (data.travelByMotorbike) {
    console.group("🏍️ Result 2 – Motorbike");

    const distance = Number(data.motorbikeDistanceKm);
    const type = data.motorbikeType;
    const factor = motorbikeEmissionFactors?.[type] || 0;

    result2 = distance * factor;

    console.log({ distance, type, factor, result2 });
    console.groupEnd();
  }

  /* ==================== RESULT 3 – TAXI ==================== */
  if (data.travelByTaxi) {
    console.group("🚕 Result 3 – Taxi");

    const passengers = Number(data.taxiPassengers);
    const distance = Number(data.taxiDistanceKm);
    const type = data.taxiType;
    const factor = taxiEmissionFactors?.[type] || 0;

    result3 = passengers * distance * factor;

    console.log({ passengers, distance, type, factor, result3 });
    console.groupEnd();
  }

  /* ==================== RESULT 4 – BUS ==================== */
  if (data.travelByBus) {
    console.group("🚌 Result 4 – Bus");

    const passengers = Number(data.busPassengers);
    const distance = Number(data.busDistanceKm);
    const type = data.busType;
    const factor = busEmissionFactors?.[type] || 0;

    result4 = passengers * distance * factor;

    console.log({ passengers, distance, type, factor, result4 });
    console.groupEnd();
  }

  /* ==================== RESULT 5 – TRAIN ==================== */
  if (data.travelByTrain) {
    console.group("🚆 Result 5 – Train");

    const passengers = Number(data.trainPassengers);
    const distance = Number(data.trainDistanceKm);
    const type = data.trainType;
    const factor = trainEmissionFactors?.[type] || 0;

    result5 = passengers * distance * factor;

    console.log({ passengers, distance, type, factor, result5 });
    console.groupEnd();
  }

  /* ==================== RESULT 6 – CAR ==================== */
  if (data.travelByCar) {
    console.group("🚗 Result 6 – Car");

    const distance = Number(data.carDistanceKm);
    const carType = data.carType;
    const fuelType = data.carFuelType;

    const factor =
      carEmissionFactors?.[carType]?.[fuelType] || 0;

    result6 = distance * factor;

    console.log({ distance, carType, fuelType, factor, result6 });
    console.groupEnd();
  }

  /* ==================== RESULT 7 – HOTEL ==================== */
  if (data.hotelStay) {
    console.group("🏨 Result 7 – Hotel Stay");

    const rooms = Number(data.hotelRooms);
    const nights = Number(data.hotelNights);

    result7 = rooms * nights * HOTEL_EF;

    console.log({ rooms, nights, HOTEL_EF, result7 });
    console.groupEnd();
  }

  /* ==================== TOTAL ==================== */
  const totalKg =
    result1 +
    result2 +
    result3 +
    result4 +
    result5 +
    result6 +
    result7;

  console.group("🌍 TOTAL BUSINESS TRAVEL EMISSIONS");
  console.log("Total KgCO2e:", totalKg);
  console.log("Total TCO2e:", totalKg / 1000);
  console.groupEnd();

  console.groupEnd();

  return {
    result1_Air_KgCo2e: result1,
    result1_Air_TCo2e: result1 / 1000,

    result2_Motorbike_KgCo2e: result2,
    result2_Motorbike_TCo2e: result2 / 1000,

    result3_Taxi_KgCo2e: result3,
    result3_Taxi_TCo2e: result3 / 1000,

    result4_Bus_KgCo2e: result4,
    result4_Bus_TCo2e: result4 / 1000,

    result5_Train_KgCo2e: result5,
    result5_Train_TCo2e: result5 / 1000,

    result6_Car_KgCo2e: result6,
    result6_Car_TCo2e: result6 / 1000,

    result7_Hotel_KgCo2e: result7,
    result7_Hotel_TCo2e: result7 / 1000,

    totalEmissions_KgCo2e: totalKg,
    totalEmissions_TCo2e: totalKg / 1000,
  };
};
