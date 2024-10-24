import React, { useEffect, useState } from "react";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

type TimerProps = {
  onTick: () => number | null;
};

/**
 * Timer component that calls the `onTick` function every second and
 * displays the result as a formatted time string.
 *
 * The `onTick` function should return the number of seconds remaining or
 * have progressed, depending on the use case.
 */
export default function Timer({ onTick }: TimerProps) {
  const stableOnTickRef = useStableCurrentRef(onTick);
  const [time, setTime] = useState<number | null>(() => onTick());

  useEffect(() => {
    const onTick = stableOnTickRef.current;

    const intervalId = setInterval(() => {
      const seconds = onTick();
      setTime(seconds);
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [stableOnTickRef]);

  // Format the time as a string (e.g., "00:00:00")
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [hrs, mins, secs]
      .map((val) => String(val).padStart(2, "0"))
      .join(":");
  };

  if (time === null) {
    return null;
  }

  return <span>{formatTime(time)}</span>;
}
