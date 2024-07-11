import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button } from "antd";
import { CompanyProfile } from "react-ts-tradingview-widgets";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";
import { store } from "@hooks/useStoreStateReader";
import SymbolDetail from "@components/SymbolDetail";

// TODO: Remove
const ETFS_BY_SECTOR = {
  consumer_discretionary: ["XLY", "VCR", "IYC"],
  consumer_staples: ["XLP", "VDC", "IYK"],
  energy: ["XLE", "VDE", "IYE"],
  financials: ["XLF", "VFH", "IYF"],
  healthcare: ["XLV", "VHT", "IYH"],
  industrials: ["XLI", "VIS", "IYJ"],
  materials: ["XLB", "VAW", "IYJ"],
  real_estate: ["XLRE", "VNQ", "IYR"],
  information_technology: ["XLK", "VGT", "IYW"],
  telecommunication_services: ["XLC", "VOX", "IYZ"],
  utilities: ["XLU", "VPU", "IDU"],
};

const SectorDetail = () => {
  const { sectorName } = useParams();

  const etfs = useMemo(() => {
    const mappedSectorName = sectorName?.replaceAll("-", "_");

    // @ts-expect-error TODO: Fix this type
    return ETFS_BY_SECTOR[mappedSectorName] || [];
  }, [sectorName]);

  return (
    <div>
      <h1>{sectorName} Sector</h1>
      <p>Details about the {sectorName} sector...</p>

      {
        // @ts-expect-error TODO: Fix this type
        etfs.map((tickerSymbol) => {
          return (
            <SymbolDetail key={tickerSymbol} tickerSymbol={tickerSymbol} />
          );
        })
      }
    </div>
  );
};

export default SectorDetail;
