import React, { useEffect, useState } from "react";

import { Box, Button, Typography } from "@mui/material";

import Center from "@layoutKit/Center";
import Cover from "@layoutKit/Cover";
import Full from "@layoutKit/Full";
import FullViewport from "@layoutKit/FullViewport";
import Layout, { Content, Footer, Header } from "@layoutKit/Layout";
import Padding from "@layoutKit/Padding";
import { Outlet } from "react-router-dom";

import LockScreen from "@components/LockScreen";

import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

import formatLocalTime from "@utils/string/formatLocalTime";

import { buildTime } from "../../../public/buildTime.json";
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
        <Layout>
          <Content>
            <Center>
              <Padding style={{ textAlign: "center" }}>
                <Typography variant="h6">
                  Recent changes may require you to clear your cache in order to
                  prevent data loading errors.
                </Typography>
                <Typography sx={{ fontStyle: "italic" }}>
                  (This is a temporary measure while still in
                  &quot;Preview&quot; mode.)
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
              </Padding>
            </Center>
          </Content>
          <Footer>
            <Typography variant="body2" sx={{ textAlign: "center" }}>
              Build time: {formatLocalTime(buildTime)}
            </Typography>
          </Footer>
        </Layout>
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
