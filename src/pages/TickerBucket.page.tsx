import React, { useEffect, useMemo } from "react";

import { Typography } from "@mui/material";

import Center from "@layoutKit/Center";
import Layout, { Content, Header } from "@layoutKit/Layout";
import Padding from "@layoutKit/Padding";
import type { TickerBucket } from "@src/store";
import { useNavigate, useParams } from "react-router-dom";

import TickerBucketViewWindowManager from "@components/TickerBucketViewWindowManager";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";
import usePageTitleSetter from "@hooks/usePageTitleSetter";
import usePromise from "@hooks/usePromise";
import useStoreStateReader from "@hooks/useStoreStateReader";

import customLogger from "@utils/customLogger";
import setPageTitle from "@utils/setPageTitle";
import {
  fetchClosestTickerBucketName,
  formatTickerBucketPageTitle,
} from "@utils/tickerBucketLinkUtils";

export type TickerBucketPageProps = {
  bucketType: "portfolio" | "watchlist";
};

export default function TickerBucketPage({
  bucketType,
}: TickerBucketPageProps) {
  const { triggerUIError } = useAppErrorBoundary();

  const { tickerBuckets } = useStoreStateReader("tickerBuckets");

  const navigate = useNavigate();

  // Set the page title
  usePageTitleSetter("Determining Bucket...");

  // Extract parameters from the URL
  const { bucketName: urlBucketName } = useParams<{
    bucketType: string;
    bucketName: string;
  }>();

  const {
    data: selectedTickerBucket,
    execute: executeClosestTickerBucketSearch,
  } = usePromise<TickerBucket | null, [string, string, TickerBucket[]]>({
    fn: (bucketType, urlBucketName, tickerBuckets) =>
      fetchClosestTickerBucketName(
        urlBucketName,
        bucketType,
        tickerBuckets,
      ).then((closestBucket) => {
        if (!closestBucket) {
          // Navigate back to the buckets page of the appropriate type
          navigate(`/${bucketType}s`);
        } else {
          // TODO: If the ticker bucket has no items, navigate elsewhere

          setPageTitle(formatTickerBucketPageTitle(closestBucket));
        }

        // TODO: If the page URL doesn't match the bucket name, update it accordingly

        return closestBucket;
      }),
    onError: (err) => {
      customLogger.error(err);
      triggerUIError(new Error("Could not parse ticker bucket from URL"));
    },
    autoExecute: false,
  });

  useEffect(() => {
    if (bucketType && tickerBuckets && urlBucketName) {
      executeClosestTickerBucketSearch(
        bucketType,
        urlBucketName,
        tickerBuckets,
      );
    }
  }, [
    bucketType,
    tickerBuckets,
    urlBucketName,
    executeClosestTickerBucketSearch,
  ]);

  const formattedTickerBucketPageTitle = useMemo(() => {
    if (selectedTickerBucket) {
      const formattedTitle = formatTickerBucketPageTitle(selectedTickerBucket);

      return formattedTitle;
    }
  }, [selectedTickerBucket]);

  if (!selectedTickerBucket) {
    return (
      // TODO: Include the bucket name here
      <Center style={{ fontWeight: "bold" }}>Locating ticker bucket...</Center>
    );
  }

  return (
    <Layout>
      <Header>
        <Padding half>
          <Typography variant="body2">
            {formattedTickerBucketPageTitle}
          </Typography>
        </Padding>
      </Header>
      <Content>
        <TickerBucketViewWindowManager tickerBucket={selectedTickerBucket} />
      </Content>
    </Layout>
  );
}
