import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black/80 text-white flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-red-500 mb-4">Something went wrong</h3>
            <p className="text-gray-300 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center space-x-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}