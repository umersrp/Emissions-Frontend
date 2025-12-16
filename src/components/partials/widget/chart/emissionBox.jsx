import React from "react";

const EmissionBoxes = ({ data }) => {
  if (!data) return null;

  const {
    stationaryCombustion = {},
    transport = {},
    fugitive = {},
    emissionActivity = {},
  } = data.scope1 || {};

  const { purchasedElectricity = {}, purchasedSteam = {}, purchasedHeating = {}, purchasedCooling = {} } = data.scope2 || {};

  // Helper to format numbers with commas and decimals
  const formatNumber = (num, decimals = 2) => {
    if (typeof num !== "number") return "-";
    return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  return (
    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: 20 }}>
      {/* Stationary Combustion */}
      <div style={{ background: "#9EE8FF", padding: "20px", borderRadius: "12px", flex: "1 1 220px", minWidth: "220px" }}>
        <h3>Stationary Combustion</h3>
        <p>Total Emission t CO₂e: {formatNumber(stationaryCombustion.totalEmissionTCo2e)}</p>
        <p>Bio Emission kg CO₂e: {formatNumber(stationaryCombustion.totalBioEmissionKgCo2e)}</p>
        <p>Bio Emission t CO₂e: {formatNumber(stationaryCombustion.totalBioEmissionTCo2e)}</p>
      </div>

      {/* Transport */}
      <div style={{ background: "#FFD6A5", padding: "20px", borderRadius: "12px", flex: "1 1 220px", minWidth: "220px" }}>
        <h3>Transport</h3>
        <p>Total Emission kg CO₂e: {formatNumber(transport.totalEmissionKgCo2e)}</p>
        <p>Total Emission t CO₂e: {formatNumber(transport.totalEmissionTCo2e)}</p>
      </div>

      {/* Fugitive */}
      <div style={{ background: "#FFADAD", padding: "20px", borderRadius: "12px", flex: "1 1 220px", minWidth: "220px" }}>
        <h3>Fugitive</h3>
        <p>Total Emission kg CO₂e: {formatNumber(fugitive.totalEmissionKgCo2e)}</p>
        <p>Total Emission t CO₂e: {formatNumber(fugitive.totalEmissionTCo2e)}</p>
      </div>

      {/* Emission Activity */}
      <div style={{ background: "#D0F4DE", padding: "20px", borderRadius: "12px", flex: "1 1 220px", minWidth: "220px" }}>
        <h3>Emission Activity</h3>
        <p>Total Emission kg CO₂e: {formatNumber(emissionActivity.totalEmissionKgCo2e)}</p>
        <p>Total Emission t CO₂e: {formatNumber(emissionActivity.totalEmissionTCo2e)}</p>
      </div>

      {/* Purchased Electricity */}
      <div style={{ background: "#B5D8FF", padding: "20px", borderRadius: "12px", flex: "1 1 220px", minWidth: "220px" }}>
        <h3>Purchased Electricity</h3>
        <p>Total Location Based kg CO₂e: {formatNumber(purchasedElectricity.totalLocationKgCo2e)}</p>
        <p>Total Location Based t CO₂e: {formatNumber(purchasedElectricity.totalLocationTCo2e)}</p>
        <p>Total Market Based kg CO₂e: {formatNumber(purchasedElectricity.totalMarketKgCo2e)}</p>
        <p>Total Market Based t CO₂e: {formatNumber(purchasedElectricity.totalMarketTCo2e)}</p>
      </div>

      {/* Purchased Steam */}
      <div style={{ background: "#FFDDEE", padding: "20px", borderRadius: "12px", flex: "1 1 220px", minWidth: "220px" }}>
        <h3>Purchased Steam</h3>
        <p>Total kg CO₂e: {formatNumber(purchasedSteam.totalKgCo2e)}</p>
        <p>Total t CO₂e: {formatNumber(purchasedSteam.totalTCo2e)}</p>
      </div>

      {/* Purchased Heating */}
      <div style={{ background: "#E7D9FF", padding: "20px", borderRadius: "12px", flex: "1 1 220px", minWidth: "220px" }}>
        <h3>Purchased Heating</h3>
        <p>Total kg CO₂e: {formatNumber(purchasedHeating.totalKgCo2e)}</p>
        <p>Total t CO₂e: {formatNumber(purchasedHeating.totalTCo2e)}</p>
      </div>

      {/* Purchased Cooling */}
      <div style={{ background: "#DFFFE3", padding: "20px", borderRadius: "12px", flex: "1 1 220px", minWidth: "220px" }}>
        <h3>Purchased Cooling</h3>
        <p>Total kg CO₂e: {formatNumber(purchasedCooling.totalKgCo2e)}</p>
        <p>Total t CO₂e: {formatNumber(purchasedCooling.totalTCo2e)}</p>
      </div>
    </div>
  );
};

export default EmissionBoxes;
