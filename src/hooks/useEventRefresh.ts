import { useEffect, useState } from "react";

import { EventEmitter } from "events";

export default function useEventRefresh(
  emitter: EventEmitter,
  eventNames: string[],
) {
  // State to force re-render
  const [, setRender] = useState(0);

  useEffect(() => {
    const _handleEvent = () => {
      // Incrementing the state value to trigger re-render
      setRender((prev) => prev + 1);
    };

    // Attach all event listeners
    eventNames.forEach((eventName) => {
      emitter.on(eventName, _handleEvent);
    });

    // Cleanup function to remove event listeners
    return () => {
      eventNames.forEach((eventName) => {
        emitter.off(eventName, _handleEvent);
      });
    };
  }, [emitter, eventNames]);
}
