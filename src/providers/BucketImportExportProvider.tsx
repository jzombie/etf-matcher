import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import BucketImportExportDialogModal from "@components/BucketImportExportDialogModal";
import BucketImportFileDropModal from "@components/BucketImportFileDropModal";

import useStableCurrentRef from "@hooks/useStableCurrentRef";

import FileDragDropProvider, {
  FileDragDropContext,
} from "./FileDragDropProvider";

type BucketImportExportContextType = {
  openImportExportModal: () => void;
  closeImportExportModal: () => void;
};

export const BucketImportExportContext = createContext<
  BucketImportExportContextType | undefined
>(undefined);

export type BucketImportExportProviderProps = {
  children: React.ReactNode;
};

export default function BucketImportExportProvider({
  children,
}: BucketImportExportProviderProps) {
  const [isImportExportModalOpen, setImportExportModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Function to open modal
  const openImportExportModal = useCallback(() => {
    setImportExportModalOpen(true);
  }, []);

  // Function to close modal
  const closeImportExportModal = useCallback(() => {
    setImportExportModalOpen(false);
  }, []);

  return (
    <FileDragDropProvider>
      <BucketImportExportContext.Provider
        value={{ openImportExportModal, closeImportExportModal }}
      >
        <FileDragDropStatusListener onDragOverStateChange={setIsDragOver} />

        {children}

        <BucketImportExportDialogModal
          open={isImportExportModalOpen}
          onClose={closeImportExportModal}
        />

        <BucketImportFileDropModal open={isDragOver} />
      </BucketImportExportContext.Provider>
    </FileDragDropProvider>
  );
}

type FileDragDropStatusListenerProps = {
  onDragOverStateChange: (isDragOver: boolean) => void;
};

function FileDragDropStatusListener({
  onDragOverStateChange,
}: FileDragDropStatusListenerProps) {
  const { isDragOver } = useContext(FileDragDropContext);

  const onDragOverStateChangeStableRef = useStableCurrentRef(
    onDragOverStateChange,
  );

  useEffect(() => {
    const onDragOverStateChange = onDragOverStateChangeStableRef.current;
    onDragOverStateChange(isDragOver);
  }, [isDragOver, onDragOverStateChange, onDragOverStateChangeStableRef]);

  return null;
}
