import React from "react";

import { Container } from "@mui/material";

import Full from "@layoutKit/Full";
import Scrollable from "@layoutKit/Scrollable";

import SettingsManager from "@components/SettingsManager";

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function SettingsPage() {
  usePageTitleSetter("Settings");

  // TODO: Extract `Container` into `FullContainer` component (see `SettingsPage` for template)
  return (
    <Scrollable>
      <Container maxWidth="lg" component={Full}>
        <SettingsManager />
      </Container>
    </Scrollable>
  );
}
