import React, { useCallback, useEffect, useState } from "react";

import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

import { RustServiceTickerVectorConfig } from "@services/RustService";

import useStableCurrentRef from "@hooks/useStableCurrentRef";
import useTickerVectorConfigs from "@hooks/useTickerVectorConfigs";

import DialogModal, { DialogModalProps } from "./DialogModal";

export type TickerVectorConfigSelectorDialogModalProps = Omit<
  DialogModalProps,
  "children"
> & {
  onSelect: (nextSelectedConfig: RustServiceTickerVectorConfig) => void;
  selectedConfig: RustServiceTickerVectorConfig;
  title?: string;
};

export default function TickerVectorConfigSelectorDialogModal({
  open: isOpen,
  onSelect,
  selectedConfig,
  onClose,
  title = "Select a Model Configuration",
  ...rest
}: TickerVectorConfigSelectorDialogModalProps) {
  const onSelectStableRef = useStableCurrentRef(onSelect);
  const onCloseStableRef = useStableCurrentRef(onClose);

  const { tickerVectorConfigs } = useTickerVectorConfigs();

  // The use `useState` instead of `useRef` is because we want to trigger a
  // re-render when the selected item changes, allowing us to perform side
  // effects such as scrolling the item into view, only after it has initially
  // been rendered
  const [selectedListItemElement, setSelectedListItemElement] =
    useState<HTMLLIElement | null>(null);

  // Scroll selected list item into view
  useEffect(() => {
    if (selectedListItemElement && isOpen) {
      selectedListItemElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedListItemElement, isOpen]);

  const handleSelect = useCallback(
    (tickerVectorConfig: RustServiceTickerVectorConfig) => {
      const onSelect = onSelectStableRef.current;
      const onClose = onCloseStableRef.current;

      onSelect(tickerVectorConfig);

      if (typeof onClose === "function") {
        // Close modal on select
        onClose();
      }
    },
    [onSelectStableRef, onCloseStableRef],
  );

  // TODO: Enable keyboard navigation

  return (
    <DialogModal {...rest} open={isOpen} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <List>
          {tickerVectorConfigs.map(
            (tickerVectorConfig: RustServiceTickerVectorConfig) => {
              const isSelected = tickerVectorConfig.key === selectedConfig.key;

              return (
                <ListItem
                  key={tickerVectorConfig.key}
                  onClick={() => handleSelect(tickerVectorConfig)}
                  role="button"
                  aria-selected={isSelected}
                  ref={(el) => isSelected && setSelectedListItemElement(el)}
                  sx={{
                    backgroundColor: isSelected ? "action.selected" : undefined,
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <ListItemText
                    primary={tickerVectorConfig.key}
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          component="span"
                        >
                          {tickerVectorConfig.description}
                        </Typography>
                        <br />
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          component="span"
                        >
                          Last Trained:{" "}
                          {new Date(
                            tickerVectorConfig.last_training_time,
                          ).toLocaleDateString()}
                        </Typography>
                        <br />
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          component="span"
                        >
                          Data Source
                          {tickerVectorConfig.training_data_sources.length !== 1
                            ? "s"
                            : ""}
                          :{" "}
                          {tickerVectorConfig.training_data_sources.join(", ")}
                        </Typography>
                        <br />
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          component="span"
                        >
                          Vector Dimensions:{" "}
                          {tickerVectorConfig.vector_dimensions}
                        </Typography>
                        <br />
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          component="span"
                        >
                          Sequence Length:{" "}
                          {tickerVectorConfig.training_sequence_length}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              );
            },
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="primary"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Close
        </Button>
      </DialogActions>
    </DialogModal>
  );
}
