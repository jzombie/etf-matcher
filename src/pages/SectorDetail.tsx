import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button } from "antd";
import { CompanyProfile } from "react-ts-tradingview-widgets";
import tradingViewCopyrightStyles from "@constants/tradingViewCopyrightStyles";
import { store } from "@hooks/useStoreStateReader";

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

    // TODO: Fix type
    // @ts-ignore
    return ETFS_BY_SECTOR[mappedSectorName] || [];
  }, [sectorName]);

  return (
    <div>
      <h1>{sectorName} Sector</h1>
      <p>Details about the {sectorName} sector...</p>

      {
        // TODO: Fix type
        // @ts-ignore
        etfs.map((etf, idx) => {
          return (
            <>
              {idx > 0 && <hr style={{ opacity: 0.5, margin: 20 }} />}
              <div>
                <CompanyProfile
                  key={idx}
                  symbol={etf}
                  width="100%"
                  height={300}
                  copyrightStyles={tradingViewCopyrightStyles}
                />
                <Button onClick={() => store.addSymbolToPortfolio(etf)}>
                  Add {etf} to Portfolio
                </Button>
              </div>
            </>
          );
        })
      }
    </div>
  );
};

export default SectorDetail;
