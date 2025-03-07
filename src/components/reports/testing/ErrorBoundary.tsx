import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Report generation error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold">Report Generation Failed</h3>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}