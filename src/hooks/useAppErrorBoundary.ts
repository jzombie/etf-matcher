import { useContext } from "react";

import { ErrorBoundaryContext } from "@providers/AppErrorBoundaryProvider";

// Export the context for use in other components
export default function useAppErrorBoundary() {
  const context = useContext(ErrorBoundaryContext);
  if (context === undefined) {
    throw new Error(
      "useErrorBoundary must be used within an AppErrorBoundaryProvider",
    );
  }
  return context;
}
