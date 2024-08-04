import React, { useEffect, useState } from "react";

import { Box, ButtonBase } from "@mui/material";

import store from "@src/store";
import type {
  RustServiceETFAggregateDetail,
  RustServiceTickerDetail,
} from "@src/types";

import TickerContainer from "@components/TickerContainer";

import useURLState from "@hooks/useURLState";

import customLogger from "@utils/customLogger";
import formatCurrency from "@utils/formatCurrency";

export type ETFHolderProps = {
  etfAggregateDetail: RustServiceETFAggregateDetail;
  holdingTickerDetail: RustServiceTickerDetail;
};

export default function ETFHolderProps({
  etfAggregateDetail,
  holdingTickerDetail,
}: ETFHolderProps) {
  const { setURLState } = useURLState();

  // const navigate = useNavigate();

  // TODO: Look up more information about this symbol (i.e. holdings, etc.)

  const [holdingPercentage, setHoldingPercentage] = useState<number | null>(
    null,
  );
  const [holdingMarketValue, setHoldingMarketValue] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const etfTickerId = etfAggregateDetail.ticker_id;
    const holdingTickerId = holdingTickerDetail.ticker_id;

    customLogger.warn("TODO: Add typings for `fetchETFHoldingWeight`");

    store
      .PROTO_fetchETFHoldingWeight(etfTickerId, holdingTickerId)
      .then((resp) => {
        // @ts-expect-error TODO: Add typings
        setHoldingPercentage(resp.holding_percentage);
        // @ts-expect-error TODO: Add typings
        setHoldingMarketValue(resp.holding_market_value);
      });
  }, [etfAggregateDetail, holdingTickerDetail]);

  return (
    <TickerContainer tickerId={etfAggregateDetail.ticker_id}>
      <Box sx={{ paddingBottom: 2 }}>
        <ButtonBase
          onClick={() => {
            setURLState(
              {
                query: etfAggregateDetail.etf_symbol,
              },
              false,
              "/search",
            );
          }}
          sx={{ display: "block", width: "100%", textAlign: "left" }}
        >
          <div>
            <div style={{ fontWeight: "bold" }}>
              {etfAggregateDetail.etf_name} ({etfAggregateDetail.etf_symbol})
            </div>
            <div>
              Top Sector Market Value:{" "}
              {etfAggregateDetail.top_sector_market_value
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.top_sector_market_value,
                  )
                : "N/A"}{" "}
              ({etfAggregateDetail.currency_code})
            </div>
            <div>
              Top Market Value Industry:{" "}
              {etfAggregateDetail.top_market_value_industry_name || "N/A"}
            </div>
            <div>
              Top Market Value Sector:{" "}
              {etfAggregateDetail.top_market_value_sector_name || "N/A"}
            </div>
            <div>
              {holdingTickerDetail.symbol} Holding Percentage:{" "}
              {`${holdingPercentage?.toFixed(2)}%` || "N/A"}
            </div>
            <div>
              {holdingTickerDetail.symbol} Holding Market Value:{" "}
              {holdingMarketValue
                ? formatCurrency(
                    // TODO: This should be set to the currency code of the holding itself
                    etfAggregateDetail.currency_code,
                    holdingMarketValue,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Latest Revenue:{" "}
              {etfAggregateDetail.avg_latest_revenue
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_latest_revenue,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Latest Gross Profit:{" "}
              {etfAggregateDetail.avg_latest_gross_profit
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_latest_gross_profit,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Latest Operating Income:{" "}
              {etfAggregateDetail.avg_latest_operating_income
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_latest_operating_income,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Latest Net Income:{" "}
              {etfAggregateDetail.avg_latest_net_income
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_latest_net_income,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Previous Revenue:{" "}
              {etfAggregateDetail.avg_previous_revenue
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_previous_revenue,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Previous Gross Profit:{" "}
              {etfAggregateDetail.avg_previous_gross_profit
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_previous_gross_profit,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Previous Operating Income:{" "}
              {etfAggregateDetail.avg_previous_operating_income
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_previous_operating_income,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Previous Net Income:{" "}
              {etfAggregateDetail.avg_previous_net_income
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_previous_net_income,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Latest Total Assets:{" "}
              {etfAggregateDetail.avg_latest_total_assets
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_latest_total_assets,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Latest Total Liabilities:{" "}
              {etfAggregateDetail.avg_latest_total_liabilities
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_latest_total_liabilities,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Latest Total Stockholders&apos; Equity:{" "}
              {etfAggregateDetail.avg_latest_total_stockholders_equity
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_latest_total_stockholders_equity,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Latest Total Assets:{" "}
              {etfAggregateDetail.avg_previous_total_assets
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_previous_total_assets,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Latest Total Liabilities:{" "}
              {etfAggregateDetail.avg_previous_total_liabilities
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_previous_total_liabilities,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Latest Total Stockholder&apos; Equity:{" "}
              {etfAggregateDetail.avg_previous_total_stockholders_equity
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_previous_total_stockholders_equity,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Latest Operating Cash Flow:{" "}
              {etfAggregateDetail.avg_latest_operating_cash_flow
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_latest_operating_cash_flow,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Latest Net Cash Provided by Operating Activities:{" "}
              {etfAggregateDetail.avg_latest_net_cash_provided_by_operating_activities
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_latest_net_cash_provided_by_operating_activities,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Latest Net Cash Used for Investing Activites:{" "}
              {etfAggregateDetail.avg_latest_net_cash_used_for_investing_activities
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_latest_net_cash_used_for_investing_activities,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Latest Net Cash Used Provided by Financing Activities:{" "}
              {etfAggregateDetail.avg_latest_net_cash_used_provided_by_financing_activities
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_latest_net_cash_used_provided_by_financing_activities,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Previous Operating Cash Flow:{" "}
              {etfAggregateDetail.avg_previous_operating_cash_flow
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_previous_operating_cash_flow,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Previous Net Cash Provided by Operating Activities:{" "}
              {etfAggregateDetail.avg_previous_net_cash_provided_by_operating_activities
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_previous_net_cash_provided_by_operating_activities,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Previous Net Cash Used for Investing Activities:{" "}
              {etfAggregateDetail.avg_previous_net_cash_used_for_investing_activities
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_previous_net_cash_used_for_investing_activities,
                  )
                : "N/A"}
            </div>
            <div>
              Avg. Previous Net Cash Used Provided by Financing Activites:{" "}
              {etfAggregateDetail.avg_previous_net_cash_used_provided_by_financing_activities
                ? formatCurrency(
                    etfAggregateDetail.currency_code,
                    etfAggregateDetail.avg_previous_net_cash_used_provided_by_financing_activities,
                  )
                : "N/A"}
            </div>
          </div>
        </ButtonBase>
      </Box>
    </TickerContainer>
  );
}
