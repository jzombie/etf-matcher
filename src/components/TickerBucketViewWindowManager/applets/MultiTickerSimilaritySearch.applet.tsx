import React, { useEffect, useState } from "react";

import { Link, Typography } from "@mui/material";

import Layout, { Content, Footer } from "@layoutKit/Layout";
import { fetchEuclideanByTickerBucket } from "@services/RustService";
import { RustServiceTickerDistance } from "@services/RustService";
import { TickerBucket } from "@src/store";

import TickerPCAScatterPlot from "@components/TickerPCAScatterPlot";
import TickerVectorConfigSelectorDialogModal from "@components/TickerVectorConfigSelectorDialogModal";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";
import usePromise from "@hooks/usePromise";
import useTickerVectorConfigs from "@hooks/useTickerVectorConfigs";

import customLogger from "@utils/customLogger";

import TickerBucketViewWindowManagerAppletWrap, {
  TickerBucketViewWindowManagerAppletWrapProps,
} from "../components/TickerBucketViewWindowManager.AppletWrap";
import useTickerSelectionManagerContext from "../hooks/useTickerSelectionManagerContext";

export type MultiTickerSimilaritySearchAppletProps = Omit<
  TickerBucketViewWindowManagerAppletWrapProps,
  "children"
>;

export default function MultiTickerSimilaritySearchApplet({
  multiTickerDetails,
  ...rest
}: MultiTickerSimilaritySearchAppletProps) {
  const { triggerUIError } = useAppErrorBoundary();

  const [
    isTickerVectorConfigSelectorDialogOpen,
    setIsTickerVectorConfigSelectorDialogOpen,
  ] = useState(false);

  const { adjustedTickerBucket } = useTickerSelectionManagerContext();

  const {
    preferredTickerVectorConfigKey,
    preferredTickerVectorConfig,
    setPreferredTickerVectorConfig,
  } = useTickerVectorConfigs();

  const { data: tickerDistances, execute: fetchTickerDistances } = usePromise<
    RustServiceTickerDistance[],
    [tickerVectorConfigKey: string, adjustedTickerBucket: TickerBucket]
  >({
    fn: (tickerVectorConfigKey, adjustedTickerBucket) =>
      fetchEuclideanByTickerBucket(tickerVectorConfigKey, adjustedTickerBucket),
    onError: (err) => {
      customLogger.error(err);
      triggerUIError(new Error("Could not fetch PCA similarity results"));
    },
    autoExecute: false,
  });

  useEffect(() => {
    if (preferredTickerVectorConfigKey && adjustedTickerBucket) {
      fetchTickerDistances(
        preferredTickerVectorConfigKey,
        adjustedTickerBucket,
      );
    }
  }, [
    preferredTickerVectorConfigKey,
    adjustedTickerBucket,
    fetchTickerDistances,
  ]);

  return (
    <TickerBucketViewWindowManagerAppletWrap
      multiTickerDetails={multiTickerDetails}
      {...rest}
    >
      <Layout>
        <Content>
          {
            // TODO: Finish adding other similarity search components
          }
          <TickerPCAScatterPlot tickerDistances={tickerDistances} />
        </Content>
        <Footer>
          <Footer style={{ textAlign: "right" }}>
            <Typography
              variant="body2"
              component="span"
              sx={{ fontSize: ".8rem" }}
            >
              Using model:{" "}
              <Link
                component="button"
                variant="body2"
                onClick={() => setIsTickerVectorConfigSelectorDialogOpen(true)}
                sx={{ cursor: "pointer", color: "text.secondary" }}
              >
                {preferredTickerVectorConfigKey || "N/A"}
              </Link>
            </Typography>
          </Footer>
        </Footer>
        {preferredTickerVectorConfig && (
          <TickerVectorConfigSelectorDialogModal
            open={isTickerVectorConfigSelectorDialogOpen}
            onClose={() => setIsTickerVectorConfigSelectorDialogOpen(false)}
            selectedConfig={preferredTickerVectorConfig}
            onSelect={setPreferredTickerVectorConfig}
          />
        )}
      </Layout>
    </TickerBucketViewWindowManagerAppletWrap>
  );
}
