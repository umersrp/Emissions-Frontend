import React from 'react';

const OpenStreetMapEmbed = ({ latitude, longitude, zoom }) => {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.05}%2C${latitude - 0.05}%2C${longitude + 0.05}%2C${latitude + 0.05}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <div>
      <iframe
        width="100%"
        height="450"
        frameBorder="0"
        scrolling="no"
        marginHeight="0"
        marginWidth="0"
        src={mapUrl}
        style={{ border: '1px solid black' }}
      ></iframe>
      <br />
      <small>
        <a href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`}>
          View Larger Map
        </a>
      </small>
    </div>
  );
};

export default OpenStreetMapEmbed;
