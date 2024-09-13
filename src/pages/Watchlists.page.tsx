import React from "react";

import { Container } from "@mui/material";

import Scrollable from "@layoutKit/Scrollable";

import BucketManager from "@components/BucketManager";

import usePageTitleSetter from "@utils/usePageTitleSetter";

export default function WatchlistsPage() {
  usePageTitleSetter("Watchlists");

  // TODO: Extract `Container` into `FullContainer` component (see `SettingsPage` for template)
  return (
    <Scrollable>
      <Container maxWidth="lg">
        <BucketManager bucketType="watchlist" />
      </Container>
    </Scrollable>
  );
}
