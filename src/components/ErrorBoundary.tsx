"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-red-500 p-8 flex flex-col items-center justify-center font-mono">
          <h1 className="text-4xl font-bold mb-4">React App Crashed</h1>
          <div className="bg-red-950/50 p-6 rounded-xl border border-red-500 max-w-3xl w-full overflow-auto">
            <p className="text-lg mb-2 text-white">Error message:</p>
            <pre className="text-red-400 whitespace-pre-wrap">{this.state.error?.message}</pre>
            <p className="text-lg mt-4 mb-2 text-white">Stack trace:</p>
            <pre className="text-red-400/80 whitespace-pre-wrap text-sm">{this.state.error?.stack}</pre>
          </div>
          <button 
            className="mt-8 px-6 py-3 bg-white text-black rounded-lg font-bold"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
