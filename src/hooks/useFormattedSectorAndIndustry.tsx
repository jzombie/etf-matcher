import React, { useCallback, useMemo } from "react";

import {
  RustServiceETFAggregateDetail,
  RustServiceTickerDetail,
} from "@services/RustService";

// TODO: This may need some reconsideration considering it returns a `ReactNode`
export default function useFormattedSectorAndIndustry(
  tickerDetail?: RustServiceTickerDetail | null,
  etfAggregateDetail?: RustServiceETFAggregateDetail | null,
) {
  const formatDetail = useCallback(
    (baseEntity?: string, topEntity?: string): JSX.Element => {
      // If both are missing, return "N/A"
      if (!baseEntity && !topEntity) {
        return <>N/A</>;
      }

      // If baseDetail is missing, but aggregateDetail is present, use aggregateDetail
      if (!baseEntity) {
        return <>{topEntity}</>;
      }

      // If both are present, format them together
      if (topEntity) {
        return (
          <>
            {baseEntity}
            <br />({topEntity})
          </>
        );
      }

      // Otherwise, just return baseEntity
      return <>{baseEntity}</>;
    },
    [],
  );

  const formattedSector = useMemo(() => {
    return formatDetail(
      tickerDetail?.sector_name,
      etfAggregateDetail?.top_pct_sector_name,
    );
  }, [
    formatDetail,
    tickerDetail?.sector_name,
    etfAggregateDetail?.top_pct_sector_name,
  ]);

  const formattedIndustry = useMemo(() => {
    return formatDetail(
      tickerDetail?.industry_name,
      etfAggregateDetail?.top_pct_industry_name,
    );
  }, [
    formatDetail,
    tickerDetail?.industry_name,
    etfAggregateDetail?.top_pct_industry_name,
  ]);

  return { formattedSector, formattedIndustry };
}
