import React from "react";

import { Box, Divider, Link, Typography } from "@mui/material";
import { styled } from "@mui/system";

import Padding from "@layoutKit/Padding";
import Scrollable from "@layoutKit/Scrollable";

import EncodedImage from "@components/EncodedImage";

import useFormattedSectorAndIndustry from "@hooks/useFormattedSectorAndIndustry";

import getSymbolThirdPartyLink from "@utils/string/getSymbolThirdPartyLink";

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
                {
                  // TODO: Include link to company, ETF, etc. (and possibly include SEC filings either here or in the "fundamentals" section)
                }
              </Box>
            </>

            // TODO: Add ability to copy the symbol to clipboard (refactor current implemention in `SettingsManager`)
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
