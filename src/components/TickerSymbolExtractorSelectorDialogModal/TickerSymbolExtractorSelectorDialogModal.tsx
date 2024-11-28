import React from "react";

import DialogModal, { DialogModalProps } from "@components/DialogModal";

import TickerSymbolTextField from "./TickerSymbolTextField";

export type TickerSymbolExtractorSelectorDialogModalProps = Omit<
  DialogModalProps,
  "children"
>;

export default function TickerSymbolExtractorSelectorDialogModal({
  ...rest
}: TickerSymbolExtractorSelectorDialogModalProps) {
  // TODO: Build out as necessary
  return (
    <DialogModal {...rest}>
      <TickerSymbolTextField />
    </DialogModal>
  );
}
