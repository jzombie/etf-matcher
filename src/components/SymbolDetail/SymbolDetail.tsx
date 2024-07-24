import React, { useEffect, useMemo, useState } from "react";
import TickerContainer from "../TickerContainer";
import { Button, ButtonBase, Typography, Grid, Box } from "@mui/material";
import Padding from "@layoutKit/Padding";
import useStoreStateReader, { store } from "@hooks/useStoreStateReader";
import type {
  RustServiceTickerDetail,
  RustServiceETFAggregateDetail,
} from "@utils/callRustService";
import { MiniChart, Timeline } from "react-ts-tradingview-widgets";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";
import { styled } from "@mui/system";
import EncodedImage from "../EncodedImage";
import NewsIcon from "@mui/icons-material/Article";

import ETFHolderList from "./SymbolDetail.ETFHolderList";

import useImageBackgroundColor from "@hooks/useImageBackgroundColor";
import useURLState from "@hooks/useURLState";

import formatSymbolWithExchange from "@utils/formatSymbolWithExchange";
import formatCurrency from "@utils/formatCurrency";

export type SymbolDetailProps = React.HTMLAttributes<HTMLDivElement> & {
  tickerId: number;
  onIntersectionStateChange?: (isIntersecting: boolean) => void;
};

const LogoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "0 50px 50px 0",
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(4),
  marginRight: theme.spacing(2),
}));

const InfoContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-around",
  width: "100%",
}));

const SymbolDetailWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(4),
}));

// TODO: Rename to `TickerDetail`
export default function SymbolDetail({
  tickerId,
  onIntersectionStateChange,
  ...rest
}: SymbolDetailProps) {
  const { symbolBuckets } = useStoreStateReader(["symbolBuckets"]);
  const [tickerDetail, setSymbolDetail] = useState<
    RustServiceTickerDetail | undefined
  >(undefined);

  const logoBackgroundColorOverride = useImageBackgroundColor(
    tickerDetail?.logo_filename
  );

  const [etfAggregateDetail, setETFAggregateDetail] = useState<
    RustServiceETFAggregateDetail | undefined
  >(undefined);

  const [showNews, setShowNews] = useState(false);

  useEffect(() => {
    if (tickerId) {
      store.fetchTickerDetail(tickerId).then(setSymbolDetail);
    }
  }, [tickerId]);

  useEffect(() => {
    if (tickerDetail?.is_etf) {
      store
        .fetchETFAggregateDetailByTickerId(tickerDetail.ticker_id)
        .then(setETFAggregateDetail);
    }
  }, [tickerDetail]);

  const formattedSymbolWithExchange = useMemo(
    () => tickerDetail && formatSymbolWithExchange(tickerDetail),
    [tickerDetail]
  );

  const { setURLState, toBooleanParam } = useURLState<{
    query: string | null;
    exact: string | null;
  }>();

  if (!formattedSymbolWithExchange || !tickerDetail) {
    return null;
  }

  console.log({ tickerDetail });

  return null;

  // return (
  //   <TickerContainer
  //     style={{ marginBottom: 12 }}
  //     tickerSymbol={tickerSymbol}
  //     onIntersectionStateChange={onIntersectionStateChange}
  //     {...rest}
  //   >
  //     <SymbolDetailWrapper>
  //       <LogoContainer
  //         style={
  //           logoBackgroundColorOverride
  //             ? { backgroundColor: logoBackgroundColorOverride }
  //             : {}
  //         }
  //       >
  //         <ButtonBase
  //           onClick={() =>
  //             setURLState({
  //               query: tickerDetail?.symbol,
  //               exact: toBooleanParam(true),
  //             })
  //           }
  //         >
  //           <EncodedImage
  //             encSrc={tickerDetail?.logo_filename}
  //             title={`${tickerDetail?.symbol} logo`}
  //             style={{ width: 80, height: 80 }}
  //           />
  //         </ButtonBase>
  //       </LogoContainer>

  //       <InfoContainer>
  //         <Padding>
  //           <Grid container spacing={2}>
  //             <Grid item xs={12} md={6}>
  //               <Typography variant="h6" component="div">
  //                 Company
  //               </Typography>
  //               <Typography variant="body2">
  //                 {tickerDetail?.company_name}
  //                 &nbsp;
  //                 {`(${formattedSymbolWithExchange})`}
  //               </Typography>
  //             </Grid>
  //             <Grid item xs={12} md={6}>
  //               <Typography variant="h6" component="div">
  //                 Durability Rating
  //               </Typography>
  //               <Typography variant="body2">
  //                 {(tickerDetail?.score_avg_dca &&
  //                   `${tickerDetail?.score_avg_dca.toFixed(2)} / 5.00`) ||
  //                   "N/A"}
  //               </Typography>
  //             </Grid>
  //             <Grid item xs={12} md={6}>
  //               <Typography variant="h6" component="div">
  //                 Sector
  //               </Typography>
  //               <Typography variant="body2">
  //                 {tickerDetail?.sector_name || "N/A"}
  //                 <>
  //                   {etfAggregateDetail?.top_market_value_sector_name &&
  //                     tickerDetail?.sector_name !==
  //                       etfAggregateDetail?.top_market_value_sector_name && (
  //                       <>
  //                         {" "}
  //                         ({etfAggregateDetail.top_market_value_sector_name})
  //                       </>
  //                     )}
  //                 </>
  //               </Typography>
  //             </Grid>
  //             <Grid item xs={12} md={6}>
  //               <Typography variant="h6" component="div">
  //                 Industry
  //               </Typography>
  //               <Typography variant="body2">
  //                 {tickerDetail?.industry_name || "N/A"}
  //                 <>
  //                   {etfAggregateDetail?.top_market_value_industry_name &&
  //                     tickerDetail?.industry_name !==
  //                       etfAggregateDetail?.top_market_value_industry_name && (
  //                       <>
  //                         {" "}
  //                         ({etfAggregateDetail.top_market_value_industry_name})
  //                       </>
  //                     )}
  //                 </>
  //               </Typography>
  //             </Grid>
  //             <Grid item xs={12} md={6}>
  //               <Typography variant="h6" component="div">
  //                 ETF Status
  //               </Typography>
  //               {!tickerDetail?.is_etf ? (
  //                 <>Not ETF</>
  //               ) : (
  //                 <div
  //                   style={{
  //                     border: "1px rgba(255,255,255,.1) solid",
  //                     borderRadius: 2,
  //                     marginTop: 1,
  //                     padding: 1,
  //                     margin: 4,
  //                   }}
  //                 >
  //                   <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
  //                     Top Holdings
  //                   </Typography>
  //                   <Grid container spacing={1}>
  //                     <Grid item xs={6}>
  //                       <Typography variant="subtitle1">
  //                         Market Value
  //                       </Typography>
  //                       <Typography variant="body2">
  //                         Sector:{" "}
  //                         {etfAggregateDetail?.top_market_value_sector_name}
  //                       </Typography>
  //                       <Typography variant="body2">
  //                         Industry:{" "}
  //                         {etfAggregateDetail?.top_market_value_industry_name}
  //                       </Typography>
  //                       <Typography variant="body2">
  //                         Value:{" "}
  //                         {etfAggregateDetail?.top_sector_market_value &&
  //                           etfAggregateDetail?.currency_code &&
  //                           formatCurrency(
  //                             etfAggregateDetail.currency_code,
  //                             etfAggregateDetail.top_sector_market_value
  //                           )}
  //                       </Typography>
  //                     </Grid>
  //                     <Grid item xs={6}>
  //                       <Typography variant="subtitle1">
  //                         Percentage Weight
  //                       </Typography>
  //                       <Typography variant="body2">
  //                         Sector: {etfAggregateDetail?.top_pct_sector_name}
  //                       </Typography>
  //                       <Typography variant="body2">
  //                         Industry: {etfAggregateDetail?.top_pct_industry_name}
  //                       </Typography>
  //                       <Typography variant="body2">
  //                         Weight:{" "}
  //                         {etfAggregateDetail?.top_pct_sector_weight.toFixed(2)}
  //                       </Typography>
  //                     </Grid>
  //                   </Grid>
  //                 </div>
  //               )}
  //             </Grid>
  //           </Grid>
  //         </Padding>
  //       </InfoContainer>
  //     </SymbolDetailWrapper>

  //     <Box sx={{ height: 200 }}>
  //       <MiniChart
  //         symbol={formattedSymbolWithExchange}
  //         colorTheme="dark"
  //         width="100%"
  //         height="100%"
  //         copyrightStyles={tradingViewCopyrightStyles}
  //         dateRange="ALL"
  //       />
  //     </Box>

  //     <Box sx={{ textAlign: "center" }}>
  //       <Button onClick={() => setShowNews(!showNews)} startIcon={<NewsIcon />}>
  //         {showNews ? "Hide News" : "View News"}
  //       </Button>
  //       {symbolBuckets
  //         ?.filter((symbolBucket) => symbolBucket.isUserConfigurable)
  //         .map((symbolBucket, idx) => (
  //           <Button
  //             key={idx}
  //             onClick={() =>
  //               // TODO: Don't hardcode values, needs to add the ticker ID
  //               store.addTickerToBucket(tickerSymbol, "N/A", 1, symbolBucket)
  //             }
  //           >
  //             Add {tickerSymbol} to {symbolBucket.name}
  //           </Button>
  //         ))}
  //     </Box>

  //     {showNews && (
  //       // TODO: This seems out of date for `CRWD`, regardless if using `formattedSymbolWithExchange`
  //       // or just the `tickerSymbol` itself. Other symbols seem to be okay.
  //       <Timeline
  //         feedMode="symbol"
  //         colorTheme="dark"
  //         symbol={formattedSymbolWithExchange}
  //         width="100%"
  //         copyrightStyles={tradingViewCopyrightStyles}
  //       />
  //     )}

  //     {showNews && (
  //       <Box mt={2}>
  //         <Typography variant="h6">News</Typography>
  //         <Typography variant="body2">
  //           Placeholder for news articles related to {tickerDetail.symbol}.
  //         </Typography>
  //       </Box>
  //     )}

  //     {
  //       // TODO: Show `ETFHoldingList` (~inverse of `ETFHolderList`) if this is an ETF
  //     }
  //     <ETFHolderList tickerDetail={tickerDetail} />
  //   </SymbolContainer>
  // );
}
