import React, { createContext, useCallback, useEffect, useState } from "react";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

type FileDragDropContextType = {
  isDragOver: boolean;
};

export const FileDragDropContext = createContext<FileDragDropContextType>({
  isDragOver: false,
});

export type FileDragDropProviderProps = {
  onDragOverStateChange?: (isDragOver: boolean) => void;
  onDragOver?: (evt: DragEvent) => void;
  onDragLeave?: (evt: DragEvent) => void;
  onDrop?: (evt: DragEvent) => void;
  target?: HTMLElement | Window;
  children: React.ReactNode;
};

export default function FileDragDropProvider({
  onDragOverStateChange,
  onDragOver,
  onDragLeave,
  onDrop,
  target = window, // Default target to window
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

  // FIXME: `isFileDrag` monitoring is used to not conflict with with the
  // window manager tile dragging, however the caveat is that Safari 17.5
  // does not register this property as expected until the drop event.
  const getIsFileDragEvent: (evt: DragEvent) => boolean = useCallback(
    (evt: DragEvent) => {
      return Array.from(evt.dataTransfer?.items || []).some(
        (item) => item.kind === "file",
      );
    },
    [],
  );

  const handleDragOver = useCallback(
    (evt: DragEvent) => {
      evt.preventDefault();
      evt.stopPropagation();

      const isFileDrag = getIsFileDragEvent(evt);

      if (isFileDrag) {
        const prevIsDragOver = isDragOverCurrentRef.current;

        if (!prevIsDragOver) {
          setIsDragOver(true);
        }

        const onDragOver = onDragOverStableRef.current;
        if (typeof onDragOver === "function") {
          onDragOver(evt);
        }
      }
    },
    [getIsFileDragEvent, isDragOverCurrentRef, onDragOverStableRef],
  );

  const handleDragLeave = useCallback(
    (evt: DragEvent) => {
      evt.preventDefault();
      evt.stopPropagation();

      const isFileDrag = getIsFileDragEvent(evt);

      if (isFileDrag) {
        setIsDragOver(false);

        const onDragLeave = onDragLeaveStableRef.current;
        if (typeof onDragLeave === "function") {
          onDragLeave(evt);
        }
      }
    },
    [getIsFileDragEvent, onDragLeaveStableRef],
  );

  const handleDrop = useCallback(
    (evt: DragEvent) => {
      evt.preventDefault();
      evt.stopPropagation();

      const isFileDrag = getIsFileDragEvent(evt);

      if (isFileDrag) {
        setIsDragOver(false);

        const onDrop = onDropStableRef.current;
        if (typeof onDrop === "function") {
          onDrop(evt);
        }
      }
    },
    [getIsFileDragEvent, onDropStableRef],
  );

  // Handle the drag-over state when the file is dragged within the app bounds
  useEffect(() => {
    const dragTarget = target || window; // Fallback to window if target is not provided

    const handleDragOverEventListener = (evt: Event) =>
      handleDragOver(evt as DragEvent);
    const handleDragLeaveEventListener = (evt: Event) =>
      handleDragLeave(evt as DragEvent);
    const handleDropEventListener = (evt: Event) =>
      handleDrop(evt as DragEvent);

    dragTarget.addEventListener("dragover", handleDragOverEventListener);
    dragTarget.addEventListener("dragleave", handleDragLeaveEventListener);
    dragTarget.addEventListener("drop", handleDropEventListener);

    // Cleanup event listeners on unmount
    return () => {
      dragTarget.removeEventListener("dragover", handleDragOverEventListener);
      dragTarget.removeEventListener("dragleave", handleDragLeaveEventListener);
      dragTarget.removeEventListener("drop", handleDropEventListener);
    };
  }, [handleDragOver, handleDragLeave, handleDrop, target]);

  // Workaround for issue in Chrome 128 issue where dragging over iframe emits
  // `dragleave` and no longer captures (regardless if a div overlays it). This
  // issue was not reproducable in Firefox or Safari.
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
