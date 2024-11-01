import React from "react";

import {
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

import { DEFAULT_TICKER_VECTOR_CONFIG_KEY } from "@src/constants";

import useTickerVectorConfigs from "@hooks/useTickerVectorConfigs";

import DialogModal, { DialogModalProps } from "./DialogModal";

export type TickerVectorConfigSelectorDialogModalProps = Omit<
  DialogModalProps,
  "children"
> & {
  onSelect: (nextSelectedConfigKey: string) => void;
  selectedConfigKey: string;
};

export default function TickerVectorConfigSelectorDialogModal({
  onSelect,
  selectedConfigKey,
  onClose,
  ...rest
}: TickerVectorConfigSelectorDialogModalProps) {
  const tickerVectorConfigs = useTickerVectorConfigs();

  // Sort the configs so that 'default' comes first
  const sortedConfigs = tickerVectorConfigs.sort((a, b) => {
    if (a.key === DEFAULT_TICKER_VECTOR_CONFIG_KEY) return -1;
    if (b.key === DEFAULT_TICKER_VECTOR_CONFIG_KEY) return 1;
    return a.key.localeCompare(b.key);
  });

  return (
    <DialogModal {...rest}>
      <Typography variant="h6" gutterBottom>
        Select a Model Configuration
      </Typography>
      <List>
        {sortedConfigs.map((config) => {
          const isSelected = config.key === selectedConfigKey;
          const lastTrainingDate = new Date(config.last_training_time);
          return (
            <ListItem
              key={config.key}
              onClick={() => onSelect(config.key)}
              sx={{
                backgroundColor: isSelected ? "action.selected" : undefined,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <ListItemText
                primary={config.key}
                secondary={
                  <>
                    <Typography variant="body2" color="textSecondary">
                      {config.description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
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
