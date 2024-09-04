import React, { Component, ErrorInfo, ReactNode, createContext } from "react";

import customLogger from "@utils/customLogger";

// Define the context type
export type ErrorBoundaryContextType = {
  triggerError: (error: Error) => void;
};

// Create the context with a default value
export const ErrorBoundaryContext = createContext<
  ErrorBoundaryContextType | undefined
>(undefined);

// Define the props and state for the ErrorBoundary
export type AppErrorBoundaryProps = {
  children: ReactNode;
};

export type AppErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export default class AppErrorBoundaryProvider extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    customLogger.error("ErrorBoundary caught an error:", error, errorInfo);
    // Log the error to an error reporting service here
  }

  // Method to trigger an error manually
  triggerError = (error: Error) => {
    this.setState(AppErrorBoundaryProvider.getDerivedStateFromError(error));
    this.componentDidCatch(error, { componentStack: "" });
  };

  render() {
    return (
      <ErrorBoundaryContext.Provider
        value={{ triggerError: this.triggerError }}
      >
        {this.props.children}
      </ErrorBoundaryContext.Provider>
    );
  }
}
