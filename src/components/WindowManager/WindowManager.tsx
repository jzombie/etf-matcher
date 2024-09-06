import React, { useContext } from "react";

import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

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

// Main window manager component
export default function WindowManager() {
  return (
    <Full style={{ backgroundColor: "gray" }}>
      <Box sx={{ backgroundColor: "black", width: "100%", height: 500 }}>
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
      </Box>
    </Full>
  );
}

interface ExampleWindowProps {
  id: string;
  path: MosaicBranch[];
  totalWindowCount: number;
}

// The window component
const ExampleWindow = ({ id, path, totalWindowCount }: ExampleWindowProps) => {
  const theme = useTheme(); // Access Material-UI theme

  // Apply styles via classNames or inline using the theme
  const windowStyles = {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    height: "100%",
  };

  const toolbarStyles = {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  };

  return (
    <MosaicWindow<string>
      title={`Window ${id}`}
      path={path}
      onDragStart={() => console.log("MosaicWindow.onDragStart")}
      onDragEnd={(type) => console.log("MosaicWindow.onDragEnd", type)}
      renderToolbar={() => (
        <div style={toolbarStyles}>
          <span>{`Window ${id}`}</span>
          <div>
            <RemoveButton path={path} />
          </div>
        </div>
      )}
    >
      <div style={windowStyles}>
        {id === "b" ? (
          <AutoScaler>
            <HistoricalPriceChart
              tickerSymbol="AAPL"
              formattedSymbolWithExchange="NASDAQ:AAPL"
            />
          </AutoScaler>
        ) : (
          <Layout>
            <Header
              style={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              }}
            >
              test
            </Header>
            <Content>
              <Box
                sx={{
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText,
                  width: "100%",
                  height: "100%",
                }}
              >
                test {totalWindowCount}
              </Box>
            </Content>
            <Footer>test</Footer>
          </Layout>
        )}
      </div>
    </MosaicWindow>
  );
};

// RemoveButton to remove the window
interface RemoveButtonProps {
  path: MosaicBranch[];
}

function RemoveButton({ path }: RemoveButtonProps) {
  const { mosaicActions } = useContext(MosaicContext);

  return (
    <button
      onClick={() => mosaicActions.remove(path)}
      style={{
        backgroundColor: "#f50057",
        color: "#fff",
        border: "none",
        padding: "5px 10px",
        cursor: "pointer",
      }}
    >
      X
    </button>
  );
}
