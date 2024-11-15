import React from "react";

import LinkIcon from "@mui/icons-material/Link";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";

import Scrollable from "@layoutKit/Scrollable";

import AvatarLogo from "@components/AvatarLogo";

import useTickerSymbolNavigation from "@hooks/useTickerSymbolNavigation";

// New import for quantity input
import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../components/TickerBucketViewWindowManager.AppletWrap";
import useTickerSelectionManagerContext from "../hooks/useTickerSelectionManagerContext";

export type MultiTickerManagerAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

export default function MultiTickerManagerApplet({
  multiTickerDetails,
  ...rest
}: MultiTickerManagerAppletProps) {
  const { selectTicker, deselectTicker, selectedTickers } =
    useTickerSelectionManagerContext();

  const navigateToSymbol = useTickerSymbolNavigation();

  // TODO: Add ability to copy the selected ticker symbols (search for `copySymbolsToClipboard` and refactor)

  return (
    <TickerBucketViewWindowManagerAppletWrap
      multiTickerDetails={multiTickerDetails}
      {...rest}
    >
      <Scrollable>
        {multiTickerDetails?.map((tickerDetail) => {
          const isSelected = selectedTickers.some(
            (ticker) => ticker.tickerId === tickerDetail.ticker_id,
          );

          return (
            <Box
              key={tickerDetail.ticker_id}
              display="flex"
              alignItems="center"
              padding={1}
              sx={{
                cursor: "pointer",
              }}
              onClick={() =>
                isSelected
                  ? deselectTicker(tickerDetail.ticker_id)
                  : selectTicker({
                      tickerId: tickerDetail.ticker_id,
                      exchangeShortName: tickerDetail.exchange_short_name,
                      symbol: tickerDetail.symbol,
                      quantity: 1,
                    })
              }
            >
              <Checkbox
                checked={isSelected}
                onChange={(evt) => {
                  evt.stopPropagation(); // Prevent the parent click handler from firing
                  evt.target.checked
                    ? selectTicker({
                        tickerId: tickerDetail.ticker_id,
                        exchangeShortName: tickerDetail.exchange_short_name,
                        symbol: tickerDetail.symbol,
                        quantity: 1,
                      })
                    : deselectTicker(tickerDetail.ticker_id);
                }}
              />
              <AvatarLogo
                tickerDetail={tickerDetail}
                style={{ marginRight: 8 }}
                onClick={(e) => e.stopPropagation()} // Prevent double triggering
              />
              <Box>
                <Box display="flex" alignItems="center">
                  {/* Symbol and Button */}
                  <Box display="flex" alignItems="center" marginRight={1}>
                    <Box
                      sx={{
                        fontWeight: "bold",
                        marginRight: 1,
                      }}
                    >
                      {tickerDetail.symbol}
                    </Box>
                    <Box fontSize="small" color="text.secondary">
                      {tickerDetail.exchange_short_name}
                    </Box>
                  </Box>

                  {/* Adjacent Link */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    title="View Details"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering parent click handler
                      navigateToSymbol(tickerDetail.symbol);
                    }}
                  >
                    <LinkIcon
                      fontSize="small"
                      sx={{
                        marginLeft: 0.5,
                        color: "text.secondary",
                        "&:hover": { color: "primary.main" },
                      }}
                    />
                  </Box>
                </Box>

                {/* Company Name */}
                <Box
                  sx={{
                    fontSize: "small",
                    color: "text.secondary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "200px", // Adjust based on layout needs
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                  title={tickerDetail.company_name} // Tooltip for full name
                >
                  {tickerDetail.company_name}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Scrollable>
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
