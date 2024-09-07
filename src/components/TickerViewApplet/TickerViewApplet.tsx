import React, { useEffect, useMemo, useState } from "react";

import { Box, Button } from "@mui/material";

import AutoScaler from "@layoutKit/AutoScaler";
import Center from "@layoutKit/Center";
import Layout, { Content, Header } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";
import { MosaicNode, MosaicParent } from "react-mosaic-component";

import SectorsPieChart from "@components/SectorsPieChart";
import WindowManager from "@components/WindowManager";

import useTickerDetail from "@hooks/useTickerDetail";

import {
  RustServiceETFAggregateDetail,
  fetchETFAggregateDetailByTickerId,
} from "@utils/callRustService";
import customLogger from "@utils/customLogger";
import formatSymbolWithExchange from "@utils/string/formatSymbolWithExchange";

import ETFHolderList from "./applets/ETFHolderList.applet";
import ETFHoldingList from "./applets/ETFHoldingList.applet";
import HistoricalPriceChart from "./applets/HistoricalPriceChart.applet";
import PCAScatterPlot from "./applets/PCAScatterPlot.applet";
import TickerInformation from "./applets/TickerInformation.applet";

export type TickerViewAppletProps = {
  tickerId: number;
};

export default function TickerViewApplet({ tickerId }: TickerViewAppletProps) {
  const { tickerDetail, isLoadingTickerDetail } = useTickerDetail(tickerId);

  // State to track ETF aggregate details
  const [etfAggregateDetail, setETFAggregateDetail] = useState<
    RustServiceETFAggregateDetail | undefined
  >(undefined);

  useEffect(() => {
    if (tickerDetail?.is_etf) {
      fetchETFAggregateDetailByTickerId(tickerDetail.ticker_id).then(
        setETFAggregateDetail,
      );
    }
  }, [tickerDetail]);

  // State to track layout and open windows
  const [layout, setLayout] = useState<MosaicNode<string> | null>(null);
  const [openWindows, setOpenWindows] = useState<Set<string>>(new Set());

  // Function to update open windows based on the current layout
  const updateOpenWindows = (layout: MosaicNode<string> | null) => {
    const findOpenWindows = (node: MosaicNode<string> | null): string[] => {
      if (!node) return [];
      if (typeof node === "string") return [node];
      return [
        ...findOpenWindows((node as MosaicParent<string>).first),
        ...findOpenWindows((node as MosaicParent<string>).second),
      ];
    };

    const openWindowSet = new Set(findOpenWindows(layout));
    setOpenWindows(openWindowSet);
  };

  // Function to toggle the window by adding/removing it from the layout
  const toggleWindow = (windowId: string) => {
    if (openWindows.has(windowId)) {
      // Remove the window from the layout
      setLayout((prevLayout) => removeWindowFromLayout(prevLayout, windowId));
    } else {
      // Add the window back to the layout
      setLayout((prevLayout) => {
        const newLayout = addWindowToLayout(prevLayout, windowId);
        setOpenWindows((prev) => new Set(prev).add(windowId)); // Add to open windows
        return newLayout;
      });
    }
  };

  // Initial layout
  const initialValue: MosaicNode<string> = useMemo(
    () => ({
      direction: "column",
      first: {
        direction: "row",
        first: "Ticker Information",
        second: {
          direction: "row",
          first: "Historical Prices",
          second: {
            direction: "row",
            first: "Similarity Search",
            second: "Sector Allocation",
            splitPercentage: 50,
          },
          splitPercentage: 55.603293949158605,
        },
        splitPercentage: 25,
      },
      second: {
        direction: "row",
        first: "ETF Holders",
        second: "ETF Holdings",
        splitPercentage: 50,
      },
      splitPercentage: 30.312061969752857,
    }),
    [],
  );

  // Handle content mapping
  const contentMap = useMemo(
    () => ({
      "Ticker Information":
        isLoadingTickerDetail || !tickerDetail ? (
          <Center>Loading</Center>
        ) : (
          <TickerInformation tickerDetail={tickerDetail} />
        ),
      "ETF Holders":
        isLoadingTickerDetail || !tickerDetail ? (
          <Center>Loading</Center>
        ) : (
          <Scrollable>
            <ETFHolderList tickerDetail={tickerDetail} />
          </Scrollable>
        ),
      "ETF Holdings":
        isLoadingTickerDetail || !tickerDetail ? (
          <Center>Loading</Center>
        ) : (
          <Scrollable>
            <ETFHoldingList etfTickerDetail={tickerDetail} />
          </Scrollable>
        ),
      "Historical Prices":
        isLoadingTickerDetail || !tickerDetail ? (
          <Center>Loading</Center>
        ) : (
          <AutoScaler>
            <HistoricalPriceChart
              tickerSymbol={tickerDetail?.symbol}
              formattedSymbolWithExchange={formatSymbolWithExchange(
                tickerDetail,
              )}
            />
          </AutoScaler>
        ),
      "Similarity Search":
        isLoadingTickerDetail || !tickerDetail ? (
          <Center>Loading</Center>
        ) : (
          <AutoScaler>
            <PCAScatterPlot tickerDetail={tickerDetail} />
          </AutoScaler>
        ),
      "Sector Allocation":
        isLoadingTickerDetail || !etfAggregateDetail ? (
          <Center>Loading</Center>
        ) : (
          etfAggregateDetail?.major_sector_distribution && (
            <SectorsPieChart
              majorSectorDistribution={
                etfAggregateDetail.major_sector_distribution
              }
            />
          )
        ),
    }),
    [etfAggregateDetail, isLoadingTickerDetail, tickerDetail],
  );

  useEffect(() => {
    setLayout(initialValue);
    updateOpenWindows(initialValue); // Initialize open windows
  }, [contentMap, initialValue]);

  return (
    <Layout>
      <Header>
        {/* Dynamically generate buttons based on contentMap */}
        <Box>
          {Object.keys(contentMap).map((key) => (
            <Button
              key={key}
              variant="contained"
              disabled={openWindows.has(key)} // Disable if window is open
              onClick={() => toggleWindow(key)} // Toggle window on click
              style={{ margin: "0 8px" }}
            >
              {key}
            </Button>
          ))}
        </Box>
      </Header>

      <Content>
        <WindowManager
          initialValue={layout || initialValue}
          contentMap={contentMap}
          onChange={(newLayout) => {
            setLayout(newLayout);
            updateOpenWindows(newLayout); // Update open windows when layout changes
            customLogger.debug({ newLayout });
          }}
        />
      </Content>
    </Layout>
  );
}

// Utility to remove a window from the layout
function removeWindowFromLayout(
  layout: MosaicNode<string> | null,
  windowId: string,
): MosaicNode<string> | null {
  if (!layout) return null;

  if (typeof layout === "string") {
    return layout === windowId ? null : layout;
  }

  const { first, second, direction } = layout as MosaicParent<string>;
  const newFirst = removeWindowFromLayout(first, windowId);
  const newSecond = removeWindowFromLayout(second, windowId);

  if (!newFirst && !newSecond) return null;
  if (!newFirst) return newSecond;
  if (!newSecond) return newFirst;

  return { first: newFirst, second: newSecond, direction };
}

// Utility to add a window to the layout
function addWindowToLayout(
  layout: MosaicNode<string> | null,
  windowId: string,
): MosaicNode<string> | null {
  if (!layout) {
    return windowId; // Add the window if layout is null
  }

  return {
    direction: "row",
    first: layout,
    second: windowId,
    splitPercentage: 50,
  };
}
