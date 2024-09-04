import React from "react";

import { Typography } from "@mui/material";

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
import ImportExportDialogModal from "./MainLayout.ImportExportDialogModal";

export default function MainLayout() {
  const { isAppUnlocked, isRustInit, isProfilingCacheOverlayOpen } =
    useStoreStateReader([
      "isAppUnlocked",
      "isRustInit",
      "isProfilingCacheOverlayOpen",
    ]);

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

      {
        // This renders dyanamically depending on store state
      }
      <ImportExportDialogModal />
    </FullViewport>
  );
}
