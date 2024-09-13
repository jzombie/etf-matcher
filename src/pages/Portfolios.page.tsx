import React from "react";

import { Container } from "@mui/material";

import Scrollable from "@layoutKit/Scrollable";

import BucketManager from "@components/BucketManager";

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function PortfoliosPage() {
  usePageTitleSetter("Portfolios");

  // TODO: Extract `Container` into `FullContainer` component (see `SettingsPage` for template)
  return (
    <Scrollable>
      <Container maxWidth="lg">
        <BucketManager bucketType="portfolio" />
      </Container>
    </Scrollable>
  );
}
