import React from "react";

import { Box, CircularProgress } from "@mui/material";

import NetworkRequestIndicator from "@components/MainLayout/Footer/NetworkRequestIndicator";

export default function NetworkProgressIndicator() {
  return (
    <Box>
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress />
      </Box>
      <NetworkRequestIndicator />
    </Box>
  );
}
