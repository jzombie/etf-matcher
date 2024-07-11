// import React from "react";
// import { Outlet, useNavigate, useLocation } from "react-router-dom";
// import SectorButtonGrid from "@components/SectorButtonGrid";

// export default function Sectors() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   return (
//     <div>
//       {location.pathname === "/sectors" && (
//         <SectorButtonGrid
//           onClick={(sectorName) => {
//             navigate(
//               `/sectors/${sectorName.replaceAll(" ", "-").toLowerCase()}`
//             );
//           }}
//         />
//       )}

//       <Outlet />
//     </div>
//   );
// }
