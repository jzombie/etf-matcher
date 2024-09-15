import React, { createContext, useCallback, useEffect, useState } from "react";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

type FileDragDropContextType = {
  isDragOver: boolean;
};

export const FileDragDropContext = createContext<FileDragDropContextType>(
  {} as FileDragDropContextType,
);

export type FileDragDropProviderProps = {
  onDragOverStateChange: (isDragOver: boolean) => void;
  onDragOver?: (evt: DragEvent) => void;
  onDragLeave?: (evt: DragEvent) => void;
  onDrop?: (evt: DragEvent) => void;
  children: React.ReactNode;
};

export default function FileDragDropProvider({
  onDragOverStateChange,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}: FileDragDropProviderProps) {
  const onDragOverStateChangeStableRef = useStableCurrentRef(
    onDragOverStateChange,
  );
  const onDragOverStableRef = useStableCurrentRef(onDragOver);
  const onDragLeaveStableRef = useStableCurrentRef(onDragLeave);
  const onDropStableRef = useStableCurrentRef(onDrop);

  const [isDragOver, setIsDragOver] = useState(false);

  const isDragOverCurrentRef = useStableCurrentRef(isDragOver);

  const handleDragOver = useCallback(
    (evt: DragEvent) => {
      evt.preventDefault();
      evt.stopPropagation();

      const prevIsDragOver = isDragOverCurrentRef.current;

      if (!prevIsDragOver) {
        setIsDragOver(true); // Drag is within bounds, show drop zone
      }

      const onDragOver = onDragOverStableRef.current;
      if (typeof onDragOver === "function") {
        onDragOver(evt);
      }
    },
    [isDragOverCurrentRef, onDragOverStableRef],
  );

  const handleDragLeave = useCallback(
    (evt: DragEvent) => {
      evt.preventDefault();
      evt.stopPropagation();

      const onDragLeave = onDragLeaveStableRef.current;
      if (typeof onDragLeave === "function") {
        onDragLeave(evt);
      }
    },
    [onDragLeaveStableRef],
  );

  const handleDrop = useCallback(
    (evt: DragEvent) => {
      evt.preventDefault();
      evt.stopPropagation();

      const onDrop = onDropStableRef.current;
      if (typeof onDrop === "function") {
        onDrop(evt);
      }
    },
    [onDropStableRef],
  );

  // Handle the drag-over state when the file is dragged within the app bounds
  useEffect(() => {
    // Add event listeners for drag and drop
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleDragOver, handleDragLeave, handleDrop]);

  // FIXME: This is a workaround for Chrome 128 where when dragging a file over an iframe,
  // regardless if a div was covering the iframe, the iframe would cause the `dragleave` event
  // to emit on the parent. I didn't experience this issue when testing with Firefox or Safari.
  useEffect(() => {
    const iframes = Array.from(window.document.querySelectorAll("iframe")); // Convert NodeList to Array

    for (const iframe of iframes) {
      iframe.style.pointerEvents = isDragOver ? "none" : "auto"; // Disable or enable pointer events
    }

    return () => {
      // Cleanup: Re-enable pointer events when drag is over or component unmounts
      for (const iframe of iframes) {
        iframe.style.pointerEvents = "auto";
      }
    };
  }, [isDragOver]);

  useEffect(() => {
    const onDragOverStateChange = onDragOverStateChangeStableRef.current;

    if (typeof onDragOverStateChange === "function") {
      onDragOverStateChange(isDragOver);
    }
  }, [isDragOver, onDragOverStateChangeStableRef]);

  return (
    <FileDragDropContext.Provider value={{ isDragOver }}>
      {children}
    </FileDragDropContext.Provider>
  );
}
