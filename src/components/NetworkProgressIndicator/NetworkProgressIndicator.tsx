import React from "react";

import { Box, CircularProgress, Typography } from "@mui/material";

import NetworkRequestIndicator from "@components/MainLayout/Footer/NetworkRequestIndicator";

import styles from "./NetworkProgressIndicator.module.scss";

export default function NetworkProgressIndicator() {
  return (
    <Box>
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress />
      </Box>
      <NetworkRequestIndicator style={{ opacity: 0.5 }} />
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="body2"
          color="secondary"
          className={styles.fadeInOut}
        >
          Building cache...
        </Typography>
      </Box>
    </Box>
  );
}
