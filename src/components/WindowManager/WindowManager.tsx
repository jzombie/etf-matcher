import React, { useContext } from "react";

// TODO: Finish building out
import AutoScaler from "@layoutKit/AutoScaler";
import Full from "@layoutKit/Full";
import Layout, { Content, Footer, Header } from "@layoutKit/Layout";
import {
  Mosaic,
  MosaicBranch,
  MosaicContext,
  MosaicWindow,
} from "react-mosaic-component";
import "react-mosaic-component/react-mosaic-component.css";

import HistoricalPriceChart from "@components/TickerDetail/TickerDetail.HistoricalPriceChart";

// TODO: Handle
export type WindowManagerProps = unknown;

export default function WindowManager() {
  return (
    <Full id="app" style={{ backgroundColor: "gray" }}>
      <div style={{ backgroundColor: "black", width: "100%", height: 500 }}>
        <Mosaic<string>
          renderTile={(id, path) => (
            <ExampleWindow id={id} path={path} totalWindowCount={3} />
          )}
          initialValue={{
            direction: "column",
            first: "a",
            second: {
              direction: "row",
              first: "b",
              second: "c",
            },
            splitPercentage: 40,
          }}
        />
      </div>
    </Full>
  );
}

interface ExampleWindowProps {
  id: string;
  path: MosaicBranch[];
  totalWindowCount: number;
}

const ExampleWindow = ({ id, path, totalWindowCount }: ExampleWindowProps) => {
  return (
    <MosaicWindow<string>
      title={`Window ${id}`}
      path={path}
      onDragStart={() => console.log("MosaicWindow.onDragStart")}
      onDragEnd={(type) => console.log("MosaicWindow.onDragEnd", type)}
      toolbarControls={React.Children.toArray([<RemoveButton path={path} />])}
    >
      {id === "b" ? (
        <AutoScaler>
          <HistoricalPriceChart
            tickerSymbol="AAPL"
            formattedSymbolWithExchange="NASDAQ:AAPL"
          />
        </AutoScaler>
      ) : (
        <Layout>
          <Header style={{ backgroundColor: "gray" }}>test</Header>
          <Content>
            <div
              style={{
                backgroundColor: "yellow",
                color: "#000",
                width: "100%",
                height: "100%",
              }}
            >
              test {totalWindowCount}
            </div>
          </Content>
          <Footer style={{ backgroundColor: "gray" }}>test</Footer>
        </Layout>
      )}
    </MosaicWindow>
  );
};

// Updated RemoveButton to use the correct `path`
interface RemoveButtonProps {
  path: MosaicBranch[];
}

// Based on: https://github.com/nomcopter/react-mosaic/blob/master/src/buttons/RemoveButton.tsx
function RemoveButton({ path }: RemoveButtonProps) {
  const { mosaicActions } = useContext(MosaicContext);

  return <button onClick={() => mosaicActions.remove(path)}>X</button>;
}
