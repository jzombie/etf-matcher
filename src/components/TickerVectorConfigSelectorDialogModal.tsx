import React from "react";

import {
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

import { RustServiceTickerVectorConfig } from "@services/RustService";

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
  onSelect,
  selectedConfig,
  onClose,
  title = "Select a Model Configuration",
  ...rest
}: TickerVectorConfigSelectorDialogModalProps) {
  const { tickerVectorConfigs } = useTickerVectorConfigs();

  return (
    <DialogModal {...rest} onClose={onClose}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <List>
        {tickerVectorConfigs.map(
          (tickerVectorConfig: RustServiceTickerVectorConfig) => {
            const isSelected = tickerVectorConfig.key === selectedConfig.key;

            return (
              <ListItem
                key={tickerVectorConfig.key}
                onClick={() => onSelect(tickerVectorConfig)}
                role="button"
                aria-selected={isSelected}
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
                        {tickerVectorConfig.last_training_time.toLocaleDateString()}
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
                        : {tickerVectorConfig.training_data_sources.join(", ")}
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
      <Button
        onClick={onClose}
        color="primary"
        variant="contained"
        sx={{ mt: 2 }}
      >
        Close
      </Button>
    </DialogModal>
  );
}
