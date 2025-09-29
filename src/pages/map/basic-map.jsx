import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";

const BasicMap = () => {
  // Coordinates for the starting and ending points
  const positionStart = [47.31322, -1.319482]; // Starting point
  const initialEnd = [-9.800482,47.50012];   // Initial ending point

  // State to manage the current position of the ending point
  const [positionEnd, setPositionEnd] = useState(initialEnd);

  // Coordinates for the Polyline
  const polylinePositions = [positionStart, positionEnd];

  useEffect(() => {
    const interval = setInterval(() => {
      setPositionEnd((prev) => {
        // Calculate the new position
        const latDiff = (positionStart[0] - prev[0]) * 0.1; // Move 10% closer
        const lngDiff = (positionStart[1] - prev[1]) * 0.1;

        return [prev[0] + latDiff, prev[1] + lngDiff];
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="w-full h-[1200px]">
      <MapContainer
        center={positionStart}
        zoom={8}
        maxZoom={18}
        minZoom={3}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker for Starting Point */}
        <Marker position={positionStart}>
          <Popup>
            <div>Start Point</div>
          </Popup>
        </Marker>

        {/* Marker for Moving Ending Point */}
        <Marker position={positionEnd}>
          <Popup>
            <div>End Point</div>
          </Popup>
        </Marker>

        {/* Polyline for the Route */}
        <Polyline
          positions={polylinePositions}
          color="blue"
          weight={5}
          opacity={0.7}
        />
      </MapContainer>
    </div>
  );
};

export default BasicMap;
