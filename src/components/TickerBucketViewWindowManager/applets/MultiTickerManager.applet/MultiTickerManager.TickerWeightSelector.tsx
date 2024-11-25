import React, {
  ChangeEvent,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";

import { Box, BoxProps, Input, InputLabel } from "@mui/material";

import LogarithmicSlider from "@components/LogarithmicSlider";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

import formatNumberWithCommas from "@utils/string/formatNumberWithCommas";

type TickerWeightSeletorProps = Omit<BoxProps, "onChange"> & {
  isTiling: boolean;
  min: number;
  max: number;
  onChange: (evt: Event, value: number) => void;
  defaultValue?: number;
  value?: number;
  disabled?: boolean;
  tickerSymbol?: string;
  inputLabel?: string;
};

export default function TickerWeightSelector({
  isTiling,
  min,
  max,
  onChange,
  defaultValue,
  value,
  disabled,
  tickerSymbol,
  inputLabel = "Weight",
  ...rest
}: TickerWeightSeletorProps) {
  const onChangeStableRef = useStableCurrentRef(onChange);

  const [componentValue, setComponentValue] = useState<number>(
    defaultValue || value || 0,
  );

  // Prevent MUI warnings regarding changing the default value
  const defaultValueRef = useRef(defaultValue);

  const handleChange = useCallback(
    (evt: Event | ChangeEvent<HTMLInputElement>, value: number) => {
      if (!value || value < 0) {
        value = 0;
      }

      const onChange = onChangeStableRef.current;

      setComponentValue(value);

      onChange(evt as Event, value);
    },
    [onChangeStableRef],
  );

  const handleInputChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      // Remove commas from the input value
      const rawValue = evt.target.value.replace(/,/g, "");
      const parsedValue = parseFloat(rawValue);

      handleChange(evt, isNaN(parsedValue) ? min : parsedValue);
    },
    [handleChange, min],
  );

  const inputId = useId();

  return (
    <Box {...rest}>
      <Box>
        <LogarithmicSlider
          aria-label={`${tickerSymbol || "Ticker"} ${inputLabel} Slider`}
          valueLabelDisplay="auto"
          min={min}
          max={max}
          step={1}
          sx={{
            color: "primary.main",
          }}
          formatValueLabel={(logValue) => formatNumberWithCommas(logValue)}
          defaultValue={defaultValueRef.current}
          value={componentValue}
          onChange={handleChange}
          disabled={disabled}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isTiling ? "right" : "left",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <InputLabel
          htmlFor={inputId}
          sx={{
            marginRight: 1, // Space between label and input
            fontSize: "0.875rem", // Match the input font size
            color: "text.secondary", // Optional: Adjust label color
          }}
        >
          {inputLabel}
        </InputLabel>
        <Input
          id={inputId}
          type="text" // Use text to allow formatted input
          value={formatNumberWithCommas(componentValue)}
          onChange={handleInputChange}
          inputProps={{
            min,
            max,
          }}
          disabled={disabled}
          sx={{
            fontSize: "0.875rem",
          }}
        />
      </Box>
    </Box>
  );
}
