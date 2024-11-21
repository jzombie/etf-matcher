import React, { useCallback, useMemo } from "react";

import Slider, { SliderProps } from "@mui/material/Slider";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

export type LogarithmicSliderProps = Omit<SliderProps, "onChange"> & {
  min: number;
  max: number;
  defaultValue?: number; // Initial value
  formatValueLabel?: (value: number) => number | string;
  onChange?: (evt: Event, value: number) => void;
  value?: number;
};

// Note: This component does not currently support logarithmic range
// selection, only a single value
export default function LogarithmicSlider({
  min,
  max,
  defaultValue = 1,
  formatValueLabel,
  onChange,
  value,
  ...rest
}: LogarithmicSliderProps) {
  const onChangeStableRef = useStableCurrentRef(onChange);
  const formatValueLabelStableRef = useStableCurrentRef(formatValueLabel);

  // Convert slider value from linear to logarithmic scale
  const logScale = useCallback(
    (linearValue: number) => {
      const logMin = Math.log10(min);
      const logMax = Math.log10(max);
      const scale = logMin + (linearValue / 100) * (logMax - logMin);
      return Math.pow(10, scale);
    },
    [min, max],
  );

  // Convert logarithmic value back to slider percentage
  const linearScale = useCallback(
    (logValue: number) => {
      const logMin = Math.log10(min);
      const logMax = Math.log10(max);
      return ((Math.log10(logValue) - logMin) / (logMax - logMin)) * 100;
    },
    [min, max],
  );

  const handleChange = useCallback(
    (evt: Event, newValue: number | number[]) => {
      const onChange = onChangeStableRef.current;

      if (onChange) {
        onChange(evt, logScale(newValue as number));
      }
    },
    [onChangeStableRef, logScale],
  );

  const handleFormatValueLabel = useCallback(
    (linearValue: number) => {
      const formatValueLabel = formatValueLabelStableRef.current;

      const logValue = logScale(linearValue);

      if (typeof formatValueLabel === "function") {
        return formatValueLabel(logValue);
      } else {
        return logValue;
      }
    },
    [formatValueLabelStableRef, logScale],
  );

  return (
    <Slider
      {...rest}
      min={0}
      max={100}
      step={0.1}
      defaultValue={linearScale(defaultValue || min)}
      valueLabelFormat={handleFormatValueLabel}
      value={value && linearScale(value)}
      onChange={handleChange}
    />
  );
}
