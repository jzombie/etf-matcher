import React, { useMemo } from "react";

import { Box, Divider, Link, Typography } from "@mui/material";
import { styled } from "@mui/system";

import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";
import { Link as ReactRouterLink } from "react-router-dom";

import EncodedImage from "@components/EncodedImage";

import useFormattedSectorAndIndustry from "@hooks/useFormattedSectorAndIndustry";
import useStoreStateReader, { store } from "@hooks/useStoreStateReader";

import getSymbolThirdPartyLink from "@utils/string/getSymbolThirdPartyLink";
import {
  formatTickerBucketPageTitle,
  getTickerBucketLink,
} from "@utils/tickerBucketLinkUtils";

import TickerViewWindowManagerAppletWrap, {
  TickerViewWindowManagerAppletWrapProps,
} from "../components/TickerViewWindowManager.AppletWrap";
import TickerViewWindowManagerBucketManager from "../components/TickerViewWindowManager.BucketManager";

export type TickerInformationAppletProps = Omit<
  TickerViewWindowManagerAppletWrapProps,
  "children"
>;

export default function TickerInformationApplet({
  tickerDetail,
  etfAggregateDetail,
  isTiling,
  ...rest
}: TickerInformationAppletProps) {
  const { formattedSector, formattedIndustry } = useFormattedSectorAndIndustry(
    tickerDetail,
    etfAggregateDetail,
  );

  const { tickerBuckets } = useStoreStateReader("tickerBuckets");

  const linkableTickerBuckets = useMemo(() => {
    // Note: `tickerBuckets` is used as a dependency to ensure this hook
    // re-renders when they have changed
    if (tickerBuckets && tickerDetail) {
      return store
        .getTickerBucketsWithTicker(tickerDetail?.ticker_id)
        .filter((tickerBucket) => tickerBucket.isUserConfigurable);
    }

    return null;
  }, [tickerDetail, tickerBuckets]);

  return (
    <TickerViewWindowManagerAppletWrap
      tickerDetail={tickerDetail}
      etfAggregateDetail={etfAggregateDetail}
      isTiling={isTiling}
      {...rest}
    >
      <Scrollable style={{ textAlign: "center" }}>
        <Padding>
          {/* Logo Section */}
          <LogoWrapper>
            <EncodedImage
              encSrc={tickerDetail?.logo_filename}
              title={`${tickerDetail?.symbol} logo`}
              style={{
                width: "100%",
                maxWidth: "80px",
                objectFit: "contain",
              }}
            />
          </LogoWrapper>

          {/* Information Section */}

          <InfoWrapper>
            <InfoItem
              label="Symbol"
              value={`${tickerDetail?.symbol}${tickerDetail?.exchange_short_name ? ` (${tickerDetail.exchange_short_name})` : ""}`}
            />
            <InfoItem
              label="Company"
              value={tickerDetail?.company_name || "N/A"}
            />
            <InfoItem label="Sector" value={formattedSector} />
            <InfoItem label="Industry" value={formattedIndustry} />
            {tickerDetail?.is_etf && (
              <InfoItem
                label="Expense Ratio"
                value={
                  etfAggregateDetail?.expense_ratio
                    ? `${etfAggregateDetail.expense_ratio.toFixed(2)}%`
                    : "N/A"
                }
              />
            )}
            {
              // TODO: Add asset class, etc.
            }
          </InfoWrapper>
          {tickerDetail && (
            <>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ fontSize: ".8rem" }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold" }}
                  gutterBottom
                >
                  External Resources
                </Typography>
                <Link
                  sx={{ mx: 0.5 }}
                  href={getSymbolThirdPartyLink({
                    tickerSymbol: tickerDetail?.symbol,
                    companyName: tickerDetail?.company_name,
                    isETF: tickerDetail?.is_etf,
                    provider: "stockanalysis.com",
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${tickerDetail?.symbol} on stockanalysis.com`}
                >
                  stockanalysis.com
                </Link>
                <Link
                  sx={{ mx: 0.5 }}
                  href={getSymbolThirdPartyLink({
                    tickerSymbol: tickerDetail?.symbol,
                    companyName: tickerDetail?.company_name,
                    isETF: tickerDetail?.is_etf,
                    provider: "google.com",
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${tickerDetail?.symbol} on stockanalysis.com`}
                >
                  google.com
                </Link>
              </Box>
              {linkableTickerBuckets && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ fontSize: ".8rem" }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold" }}
                      gutterBottom
                    >
                      Associated Bucket
                      {linkableTickerBuckets.length !== 1 ? "s" : ""}
                    </Typography>
                    {linkableTickerBuckets.map((tickerBucket) => (
                      <ReactRouterLink
                        key={tickerBucket.uuid}
                        to={getTickerBucketLink(tickerBucket)}
                        style={{ margin: 2 }}
                      >
                        {formatTickerBucketPageTitle(tickerBucket)}
                      </ReactRouterLink>
                    ))}
                    {/* <Link
                  sx={{ mx: 0.5 }}
                  href={getSymbolThirdPartyLink({
                    tickerSymbol: tickerDetail?.symbol,
                    companyName: tickerDetail?.company_name,
                    isETF: tickerDetail?.is_etf,
                    provider: "stockanalysis.com",
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${tickerDetail?.symbol} on stockanalysis.com`}
                >
                  stockanalysis.com
                </Link>
                <Link
                  sx={{ mx: 0.5 }}
                  href={getSymbolThirdPartyLink({
                    tickerSymbol: tickerDetail?.symbol,
                    companyName: tickerDetail?.company_name,
                    isETF: tickerDetail?.is_etf,
                    provider: "google.com",
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${tickerDetail?.symbol} on stockanalysis.com`}
                >
                  google.com
                </Link> */}
                  </Box>
                </>
              )}
            </>

            // TODO: Add ability to copy the symbol to clipboard (search for `copySymbolsToClipboard` and refactor)
          )}
        </Padding>
      </Scrollable>
      {!isTiling && tickerDetail && (
        <TickerViewWindowManagerBucketManager tickerDetail={tickerDetail} />
      )}
    </TickerViewWindowManagerAppletWrap>
  );
}

// Wrapper for logo
const LogoWrapper = styled(Box)(() => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "16px",
}));

// Flexbox-based wrapper for the information section
const InfoWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-start", // Align all items to the start
  alignItems: "stretch", // Ensure equal height
  flexWrap: "wrap", // Allow wrapping when necessary
  gap: theme.spacing(2), // Consistent spacing between items
  padding: theme.spacing(2), // Padding around the content
}));

// InfoItem component for individual pieces of information
function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | JSX.Element | React.ReactNode | undefined;
}) {
  return (
    <Box flex="1 1 150px">
      {" "}
      {/* Flex item with a minimum width of 150px */}
      <Typography variant="subtitle2" fontWeight="bold">
        {label}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {value}
      </Typography>
    </Box>
  );
}
