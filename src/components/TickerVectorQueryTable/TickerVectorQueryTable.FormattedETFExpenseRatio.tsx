import React from "react";

import { Typography } from "@mui/material";

import type {
  RustServiceTickerDetailWithCosineSimilarity,
  RustServiceTickerDetailWithEuclideanDistance,
} from "@hooks/useTickerVectorQuery";

export type FormattedETFExpenseRatioProps = {
  tickerDetail:
    | RustServiceTickerDetailWithEuclideanDistance
    | RustServiceTickerDetailWithCosineSimilarity;
};

export default function FormattedETFExpenseRatio({
  tickerDetail,
}: FormattedETFExpenseRatioProps) {
  return (
    <>
      {tickerDetail.etf_expense_ratio ? (
        `${tickerDetail.etf_expense_ratio.toFixed(2)}%`
      ) : (
        <Typography variant="body2" sx={{ fontStyle: "italic", opacity: 0.5 }}>
          Not ETF
        </Typography>
      )}
    </>
  );
}