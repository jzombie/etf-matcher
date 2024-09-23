import { useCallback, useEffect } from "react";
import { SyntheticEvent } from "react";

import useStableCurrentRef from "../useStableCurrentRef";

export type KeyboardEventsProps = {
  keydown?: { [key: string]: (event: KeyboardEvent) => void };
  keyup?: { [key: string]: (event: KeyboardEvent) => void };
  attachToWindow?: boolean;
};

export default function useKeyboardEvents({
  attachToWindow = true,
  ...rest
}: KeyboardEventsProps) {
  const keydownCallbacksStableRef = useStableCurrentRef(rest.keydown || {});
  const keyupCallbacksStableRef = useStableCurrentRef(rest.keyup || {});

  const handleUnifiedCallback = useCallback(
    (evt: KeyboardEvent, callback?: (event: KeyboardEvent) => void) => {
      if (callback) {
        evt.stopPropagation();
        evt.preventDefault();
        callback(evt);
      }
    },
    [],
  );

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent) => {
      const callback = keydownCallbacksStableRef.current[evt.key];
      handleUnifiedCallback(evt, callback);
    },
    [handleUnifiedCallback, keydownCallbacksStableRef],
  );

  const handleKeyUp = useCallback(
    (evt: KeyboardEvent) => {
      const callback = keyupCallbacksStableRef.current[evt.key];
      handleUnifiedCallback(evt, callback);
    },
    [handleUnifiedCallback, keyupCallbacksStableRef],
  );

  useEffect(() => {
    if (attachToWindow) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }
  }, [attachToWindow, handleKeyDown, handleKeyUp]);

  // Return handlers for keydown and keyup, adapting for SyntheticEvent
  return {
    onKeyDown: (event: SyntheticEvent) =>
      handleKeyDown(event.nativeEvent as KeyboardEvent),
    onKeyUp: (event: SyntheticEvent) =>
      handleKeyUp(event.nativeEvent as KeyboardEvent),
  };
}
