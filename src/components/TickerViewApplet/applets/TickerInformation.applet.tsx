import React from "react";

import Center from "@layoutKit/Center";

import EncodedImage from "@components/EncodedImage";

import { RustServiceTickerDetail } from "@utils/callRustService";

export type TickerInformationProps = {
  tickerDetail: RustServiceTickerDetail;
};

export default function TickerInformation({
  tickerDetail,
}: TickerInformationProps) {
  return (
    <Center>
      <EncodedImage encSrc={tickerDetail.logo_filename} />
    </Center>
  );
}
