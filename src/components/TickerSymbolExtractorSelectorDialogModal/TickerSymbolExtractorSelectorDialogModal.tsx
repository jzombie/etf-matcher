import React from "react";

import { extractSearchResultsFromText } from "@services/RustService";

import DialogModal, { DialogModalProps } from "@components/DialogModal";

import customLogger from "@utils/customLogger";

import TickerSymbolTextForm from "./TickerSymbolTextForm";

export type TickerSymbolExtractorSelectorDialogModalProps = Omit<
  DialogModalProps,
  "children"
>;

export default function TickerSymbolExtractorSelectorDialogModal({
  onClose,
  ...rest
}: TickerSymbolExtractorSelectorDialogModalProps) {
  // TODO: Build out as necessary
  return (
    <DialogModal {...rest}>
      <TickerSymbolTextForm
        onSubmit={(text) => {
          // TODO: Remove
          extractSearchResultsFromText(text).then((searchResults) =>
            customLogger.debug("TODO: Handle", { searchResults }),
          );
        }}
        onCancel={onClose}
      />
    </DialogModal>
  );
}
