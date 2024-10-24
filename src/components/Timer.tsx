import React, { useEffect, useState } from "react";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

import formatTime from "@utils/string/formatTime";

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
    let rafId: number;
    let lastUpdate = Date.now();

    // The `tick` function is called before the next repaint using
    // `requestAnimationFrame`.
    //
    // This provides a more accurate timing mechanism compared to `setInterval`,
    // as it synchronizes with the browser's refresh rate and reduces drift.
    const tick = () => {
      const now = Date.now();
      // Check if at least 1000ms (1 second) has passed since the last update.
      if (now - lastUpdate >= 1000) {
        const seconds = onTick();
        setTime(seconds);
        lastUpdate = now; // Update the lastUpdate time to the current time.
      }
      // Schedule the next tick call
      rafId = requestAnimationFrame(tick);
    };

    // Start the tick loop
    rafId = requestAnimationFrame(tick);

    // Cleanup function to cancel the scheduled animation frame when the
    // component unmounts.
    //
    // This prevents memory leaks and ensures that the timer stops when
    // the component is no longer in use.
    return () => cancelAnimationFrame(rafId);
  }, [stableOnTickRef]);

  if (time === null) {
    return null;
  }

  // Render the formatted time string.
  return <span>{formatTime(time)}</span>;
}
