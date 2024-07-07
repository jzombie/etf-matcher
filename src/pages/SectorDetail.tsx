// src/pages/SectorDetail.js
import React from "react";
import { useParams } from "react-router-dom";

const SectorDetail = () => {
  const { sectorName } = useParams();

  return (
    <div>
      <h1>{sectorName} Sector</h1>
      <p>Details about the {sectorName} sector...</p>
    </div>
  );
};

export default SectorDetail;
