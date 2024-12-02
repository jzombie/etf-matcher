import React, { useEffect, useState } from "react";

import { Button } from "@mui/material";

import Center from "@layoutKit/Center";
import { extractSearchResultsFromText } from "@services/RustService";
import type {
  RustServicePaginatedResults,
  RustServiceTickerSearchResult,
} from "@services/RustService";

import DialogModal, { DialogModalProps } from "@components/DialogModal";
import NoInformationAvailableAlert from "@components/NoInformationAvailableAlert";

import useAppErrorBoundary from "@hooks/useAppErrorBoundary";
import usePromise from "@hooks/usePromise";

import customLogger from "@utils/customLogger";

import TickerSelectorForm from "./components/TickerSelectorForm";
import TickerSymbolTextForm from "./components/TickerSymbolTextForm";

export type TickerSymbolExtractorSelectorDialogModalProps = Omit<
  DialogModalProps,
  "children"
> & {
  onSelect: (selectedSearchResults: RustServiceTickerSearchResult[]) => void;
};

const SYMBOL_EXTRACTION_PHASES = [
  "input-text",
  "parse-text",
  "select-symbols",
  "no-symbols-identified",
] as const;

type SymbolExtractionPhase = (typeof SYMBOL_EXTRACTION_PHASES)[number];

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;

export default function TickerSymbolExtractorSelectorDialogModal({
  onClose,
  onSelect,
  ...rest
}: TickerSymbolExtractorSelectorDialogModalProps) {
  const { triggerUIError } = useAppErrorBoundary();

  const [phase, setPhase] = useState<SymbolExtractionPhase>("input-text");
  const [text, setText] = useState<string | null>(null);
  const [searchResults, setSearchResults] =
    useState<RustServicePaginatedResults<RustServiceTickerSearchResult> | null>(
      null,
    );

  const { execute: executeSymbolExtraction } = usePromise<
    RustServicePaginatedResults<RustServiceTickerSearchResult>,
    [string, number?, number?]
  >({
    fn: (text, page = DEFAULT_PAGE, pageSize = DEFAULT_PAGE_SIZE) =>
      extractSearchResultsFromText(text, page, pageSize).then(
        (searchResults) => {
          // customLogger.debug("TODO: Handle", { searchResults }),

          return searchResults;
        },
      ),
    initialAutoExecute: false,
    onSuccess: (searchResults) => {
      setSearchResults(searchResults);

      // TODO: Don't proceed if there are no symbols identified
      if (searchResults?.results.length) {
        setPhase("select-symbols");
      } else {
        setPhase("no-symbols-identified");
      }
    },
    onError: (err) => {
      customLogger.error(err);
      triggerUIError(new Error("An error occurred while trying to parse text"));

      setPhase("input-text");
    },
  });

  useEffect(() => {
    if (phase === "parse-text") {
      if (!text) {
        setPhase("input-text");
      } else {
        executeSymbolExtraction(text);
      }
    }
  }, [phase, text, executeSymbolExtraction, triggerUIError]);

  return (
    // TODO: Use `Transition` component to switch between phases

    <DialogModal {...rest}>
      {phase === "input-text" && (
        <TickerSymbolTextForm
          onSubmit={(text) => {
            setText(text);
            setPhase("parse-text");
          }}
          onCancel={onClose}
        />
      )}
      {phase === "parse-text" && (
        // TODO: Include loading indicator
        <Center>Processing...</Center>
      )}
      {phase === "select-symbols" && searchResults && (
        <TickerSelectorForm
          searchResults={searchResults}
          onSubmit={onSelect}
          onCancel={() => {
            // Navigate back to initial phase
            setPhase("input-text");
          }}
        />
      )}
      {phase === "no-symbols-identified" && (
        <Center>
          <NoInformationAvailableAlert>
            No symbols were identified.
          </NoInformationAvailableAlert>
          <br />
          <Button
            onClick={() => setPhase("input-text")}
            color="error"
            variant="contained"
          >
            Cancel
          </Button>
        </Center>
      )}
    </DialogModal>
  );
}
