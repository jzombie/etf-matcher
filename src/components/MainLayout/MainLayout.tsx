import React, { useEffect, useState } from "react";

import { Box, Button, Typography } from "@mui/material";

import Center from "@layoutKit/Center";
import Cover from "@layoutKit/Cover";
import Full from "@layoutKit/Full";
import FullViewport from "@layoutKit/FullViewport";
import Layout, { Content, Header } from "@layoutKit/Layout";
import { Outlet } from "react-router-dom";

import LockScreen from "@components/LockScreen";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

import MainLayoutFooter from "./Footer";
import HeaderMenu from "./HeaderMenu";

export default function MainLayout() {
  const {
    isAppUnlocked,
    isRustInit,
    isProfilingCacheOverlayOpen,
    isIndexedDBReady,
  } = useStoreStateReader([
    "isAppUnlocked",
    "isRustInit",
    "isProfilingCacheOverlayOpen",
    "isIndexedDBReady",
  ]);

  // TODO: Remove after https://linear.app/zenosmosis/issue/ZEN-86/implement-auto-reindex-strategy is implemented
  const [shouldShowRefreshInterstitial, setShouldShowRefreshInterstitial] =
    useState<boolean>(false);
  useEffect(() => {
    if (isIndexedDBReady && !store.isFreshSession) {
      setShouldShowRefreshInterstitial(true);
    }
  }, [isIndexedDBReady]);

  if (shouldShowRefreshInterstitial) {
    return (
      <FullViewport>
        <Center>
          <Typography variant="h6">
            Recent changes may require you to wipe your cache in order to
            prevent data loading errors.
          </Typography>
          <Typography sx={{ fontStyle: "italic" }}>
            (This is a temporary measure while still in &quot;Preview&quot;
            mode.)
          </Typography>
          <Box>
            <Button
              color="error"
              variant="contained"
              onClick={() => store.reset()}
              sx={{ margin: 1 }}
            >
              Clear Cache
            </Button>
            <Button
              color="primary"
              onClick={() => setShouldShowRefreshInterstitial(false)}
              sx={{ margin: 1 }}
            >
              Don&apos;t clear cache
            </Button>
          </Box>
        </Center>
      </FullViewport>
    );
  }

  if (!isAppUnlocked) {
    return (
      <LockScreen onUnlock={() => store.setState({ isAppUnlocked: true })} />
    );
  }

  return (
    <FullViewport>
      <Layout>
        <Header>
          <HeaderMenu />
        </Header>

        <Content>
          {!isRustInit ? (
            // Note: `<Full>` is not needed here, but is used for testing
            <Full>
              <Center>
                <Typography variant="h6" component="div" textAlign="center">
                  Initializing...
                </Typography>
              </Center>
            </Full>
          ) : (
            <Outlet />
          )}
        </Content>
        <MainLayoutFooter />
      </Layout>
      {isProfilingCacheOverlayOpen && (
        <Cover clickThrough>
          <Center>Profiling Cache</Center>
        </Cover>
      )}
    </FullViewport>
  );
}
