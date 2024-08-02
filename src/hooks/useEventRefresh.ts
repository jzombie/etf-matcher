import { useEffect, useState } from "react";

import { EventEmitter } from "events";

// https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/55298#discussioncomment-1609176
type EventMap<T> = { [eventName in keyof T]: unknown[] };
type DefaultEventMap = { [eventName: string | symbol]: unknown[] };

/**
 * The `useEventRefresh` hook subscribes to the given `EventEmitter` events and refreshes
 * the connected component when they are emit.
 *
 * It does not currently capture event data, as that's not an immediate use
 * case that I have for this.
 */
export default function useEventRefresh<
  T extends EventMap<T> = DefaultEventMap,
>(emitter: EventEmitter, eventNames: (keyof T)[]) {
  // State to force re-render
  const [, setRender] = useState(0);

  useEffect(() => {
    const _handleEvent = () => {
      // Incrementing the state value to trigger re-render
      setRender((prev) => prev + 1);
    };

    // Attach all event listeners
    eventNames.forEach((eventName) => {
      emitter.on(eventName as string, _handleEvent);
    });

    // Cleanup function to remove event listeners
    return () => {
      eventNames.forEach((eventName) => {
        emitter.off(eventName as string, _handleEvent);
      });
    };
  }, [emitter, eventNames]);
}
