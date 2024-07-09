import React, { useRef } from "react";

/**
 * A custom hook that provides a mutable ref object which always holds the current value.
 *
 * This hook ensures that the ref's current value is always up-to-date with the latest
 * value passed to the hook.
 */
export default function useStableCurrentRef<T>(
  currentValue: T
): React.MutableRefObject<T> {
  const activeRef = useRef(currentValue);

  activeRef.current = currentValue;

  return activeRef;
}
