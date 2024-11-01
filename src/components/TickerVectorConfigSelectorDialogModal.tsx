import React from "react";

import {
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

import { RustServiceTickerVectorConfig } from "@services/RustService";
import { DEFAULT_TICKER_VECTOR_CONFIG_KEY } from "@src/constants";

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
  const tickerVectorConfigs = useTickerVectorConfigs();

  // Sort the configs so that `default` comes first
  const sortedConfigs = tickerVectorConfigs.sort((a, b) => {
    if (a.key === DEFAULT_TICKER_VECTOR_CONFIG_KEY) return -1;
    if (b.key === DEFAULT_TICKER_VECTOR_CONFIG_KEY) return 1;
    return a.key.localeCompare(b.key);
  });

  return (
    <DialogModal {...rest}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <List>
        {sortedConfigs.map((config) => {
          const isSelected = config.key === selectedConfig.key;
          const lastTrainingDate = new Date(config.last_training_time);
          return (
            <ListItem
              key={config.key}
              onClick={() => onSelect(config)}
              sx={{
                backgroundColor: isSelected ? "action.selected" : undefined,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <ListItemText
                style={{ cursor: "pointer" }}
                primary={config.key}
                secondary={
                  <>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="span"
                    >
                      {config.description}
                    </Typography>
                    <br />
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      component="span"
                    >
                      Last Trained: {lastTrainingDate.toLocaleDateString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          );
        })}
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
