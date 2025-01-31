import React, { useMemo, useState } from "react";

import Layout, { Content, Footer } from "@layoutKit/Layout";
import type { RustServiceTickerSymbol } from "@services/RustService";

import TickerContainer from "@components/TickerContainer";
import WindowManager from "@components/WindowManager";

import useWindowSize from "@hooks/useWindowSize";

import TickerViewWindowManagerBucketManager from "./components/TickerViewWindowManager.BucketManager";
import useTickerViewWindowManagerContent from "./hooks/useTickerViewWindowManagerContent";

export type TickerViewWindowManagerProps = {
  tickerSymbol: RustServiceTickerSymbol;
};

export default function TickerViewWindowManager({
  tickerSymbol,
}: TickerViewWindowManagerProps) {
  const [isTiling, setIsTiling] = useState(true);

  const { initialLayout, contentMap, tickerDetail } =
    useTickerViewWindowManagerContent(tickerSymbol, isTiling);

  const { height: windowHeight } = useWindowSize();

  // FIXME: Ideally, this should go into a context provider so that child
  // components can know whether or not to render their own `TickerViewWindowManagerBucketManager`
  // without having to attach new listeners to the DOM. As it currently
  // stands, this component will be rendered twice on certain mobile viewports.
  const shouldShowFooter = useMemo(() => {
    if (!tickerDetail) {
      return false;
    }

    if (isTiling) {
      return true;
    }

    return windowHeight > 960;
  }, [tickerDetail, isTiling, windowHeight]);

  return (
    <TickerContainer tickerSymbol={tickerSymbol}>
      <Layout>
        <Content>
          <WindowManager
            onTilingStateChange={setIsTiling}
            initialLayout={initialLayout}
            contentMap={contentMap}
          />
        </Content>
        {shouldShowFooter && tickerDetail && (
          <Footer>
            {
              <TickerViewWindowManagerBucketManager
                tickerDetail={tickerDetail}
              />
            }
          </Footer>
        )}
      </Layout>
    </TickerContainer>
  );
}
