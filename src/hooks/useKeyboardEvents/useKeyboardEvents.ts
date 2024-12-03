import { useCallback, useEffect } from "react";
import { SyntheticEvent } from "react";

import useStableCurrentRef from "../useStableCurrentRef";

export type KeyboardEventsProps = {
  keyDown?: { [key: string]: (event: KeyboardEvent) => void };
  keyUp?: { [key: string]: (event: KeyboardEvent) => void };
  attachToWindow?: boolean;
  stopPropagation?: boolean;
  preventDefault?: boolean;
};

export default function useKeyboardEvents({
  attachToWindow = true,
  stopPropagation = true,
  preventDefault = true,
  ...rest
}: KeyboardEventsProps) {
  const keyDownCallbacksStableRef = useStableCurrentRef(rest.keyDown || {});
  const keyUpCallbacksStableRef = useStableCurrentRef(rest.keyUp || {});

  const handleUnifiedCallback = useCallback(
    (evt: KeyboardEvent, callback?: (event: KeyboardEvent) => void) => {
      if (callback) {
        if (stopPropagation) {
          evt.stopPropagation();
        }
        if (preventDefault) {
          evt.preventDefault();
        }

        callback(evt);
      }
    },
    [stopPropagation, preventDefault],
  );

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent) => {
      // FIXME: Using `evt.code` may be the *preferred* solution but it breaks
      // `Enter` key navigation on Android. Leaving as `evt.key` for now.
      // Perhaps this should be configurable.
      const callback = keyDownCallbacksStableRef.current[evt.key];
      handleUnifiedCallback(evt, callback);
    },
    [handleUnifiedCallback, keyDownCallbacksStableRef],
  );

  const handleKeyUp = useCallback(
    (evt: KeyboardEvent) => {
      // FIXME: Using `evt.code` may be the *preferred* solution but it breaks
      // `Enter` key navigation on Android. Leaving as `evt.key` for now.
      // Perhaps this should be configurable.
      const callback = keyUpCallbacksStableRef.current[evt.key];
      handleUnifiedCallback(evt, callback);
    },
    [handleUnifiedCallback, keyUpCallbacksStableRef],
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
