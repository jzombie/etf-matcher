import React, { useEffect } from "react";

import Center from "@layoutKit/Center";
import Layout, { Aside, Content, Footer, Header } from "@layoutKit/Layout";
import Scrollable from "@layoutKit/Scrollable";

import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

import customLogger from "@utils/customLogger";
import debounceWithKey from "@utils/debounceWithKey";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../../components/TickerBucketViewWindowManager.AppletWrap";
import useTickerSelectionManagerContext from "../../hooks/useTickerSelectionManagerContext";
import MultiTickerManagerTicker from "./MultiTickerManager.Ticker";

export type MultiTickerManagerAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

// Number of milliseconds to wait before applying calculation updates
const TICKER_QUANTITY_ADJUST_DEBOUNCE_TIME = 250;

export default function MultiTickerManagerApplet({
  multiTickerDetails,
  ...rest
}: MultiTickerManagerAppletProps) {
  const {
    selectTicker,
    deselectTicker,
    selectedTickers,
    adjustedTickerBucket,
  } = useTickerSelectionManagerContext();

  // TODO: Remove
  useEffect(() => {
    customLogger.debug({ multiTickerDetails, adjustedTickerBucket });
  }, [multiTickerDetails, adjustedTickerBucket]);

  const navigateToSymbol = useTickerSymbolNavigation();

  return (
    <TickerBucketViewWindowManagerAppletWrap
      multiTickerDetails={multiTickerDetails}
      {...rest}
    >
      <Layout>
        <Header>
          <Aside>to the side</Aside>
          <Content style={{ textAlign: "center" }}>Hello</Content>
          <Aside>to the side</Aside>
        </Header>
        <Content>
          <Aside style={{ border: "1px yellow solid" }}>
            <Center>test</Center>
          </Aside>
          <Aside style={{ border: "1px yellow solid" }}>
            <Center>test</Center>
          </Aside>
          <Scrollable>
            {multiTickerDetails?.map((tickerDetail) => {
              const tickerBucketTicker = adjustedTickerBucket.tickers.find(
                (tickerBucketTicker) =>
                  tickerBucketTicker.tickerId === tickerDetail.ticker_id,
              );

              const isSelected = selectedTickers.some(
                (ticker) => ticker.tickerId === tickerDetail.ticker_id,
              );

              const isDisabled = !tickerBucketTicker;

              return (
                <MultiTickerManagerTicker
                  key={tickerDetail.ticker_id}
                  adjustedTickerBucket={adjustedTickerBucket}
                  tickerDetail={tickerDetail}
                  // TODO: Memoize
                  onSelectOrModify={(adjustedTicker) => {
                    // Note: I experimented with throttling here and the performance
                    // tradeoff didn't seem worth it
                    debounceWithKey(
                      `$multi-ticker-select-${adjustedTicker.tickerId}}`,
                      () => {
                        selectTicker(adjustedTicker);
                      },
                      TICKER_QUANTITY_ADJUST_DEBOUNCE_TIME,
                    );
                  }}
                  // TODO: Memoize
                  onDeselect={() => deselectTicker(tickerDetail.ticker_id)}
                  onNavigate={() => navigateToSymbol(tickerDetail.symbol)}
                  // TODO: Don't hardcode
                  minWeight={0.001}
                  maxWeight={10000000000}
                  selected={isSelected}
                  disabled={isDisabled}
                />
              );
            })}
          </Scrollable>
          <Aside style={{ border: "1px yellow solid" }}>
            <Center>test</Center>
          </Aside>
        </Content>
        <Footer>
          <Content>Hello</Content>
          <Aside>to the side</Aside>
        </Footer>
      </Layout>
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
