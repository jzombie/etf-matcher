import { useCallback, useEffect } from "react";

import useStableCurrentRef from "./useStableCurrentRef";

type KeyEventCallbacks = {
  keydown?: { [key: string]: (event: KeyboardEvent) => void };
  keyup?: { [key: string]: (event: KeyboardEvent) => void };
};

export default function useKeyboardEvents(
  callbacks: KeyEventCallbacks,
  attachToWindow: boolean = true,
) {
  const keydownCallbacksStableRef = useStableCurrentRef(
    callbacks.keydown || {},
  );
  const keyupCallbacksStableRef = useStableCurrentRef(callbacks.keyup || {});

  // Create the keydown handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const callback = keydownCallbacksStableRef.current[event.key];
      if (callback) {
        event.preventDefault();
        callback(event);
      }
    },
    [keydownCallbacksStableRef],
  );

  // Create the keyup handler
  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      const callback = keyupCallbacksStableRef.current[event.key];
      if (callback) {
        event.preventDefault();
        callback(event);
      }
    },
    [keyupCallbacksStableRef],
  );

  // Conditionally bind window events
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

  // Return the handlers for keydown and keyup
  return {
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
  };
}
