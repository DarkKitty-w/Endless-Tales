// src/components/ErrorBoundary.tsx
"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { logger } from "../lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('ErrorBoundary caught an error', 'error-boundary', { 
      error: error.message,
      componentStack: errorInfo.componentStack 
    });
    // Optionally send to error reporting service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // ERR-10 Fix: Don't show raw error messages to users
      // Log full error to console for developers
      if (this.state.error) {
        console.error("ErrorBoundary caught error:", this.state.error);
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-background">
          <Card className="w-full max-w-md border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                An unexpected error occurred in this screen. The error has been logged to the console.
              </p>
              {/* ERR-10 Fix: Expandable technical details for developers only */}
              {this.state.error && process.env.NODE_ENV === 'development' && (
                <details className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-40">
                  <summary className="cursor-pointer font-medium mb-1">Technical Details (Dev Only)</summary>
                  <pre className="whitespace-pre-wrap">{this.state.error.message}</pre>
                  {this.state.error.stack && (
                    <pre className="whitespace-pre-wrap mt-2 text-muted-foreground">{this.state.error.stack}</pre>
                  )}
                </details>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reload App
              </Button>
              <Button onClick={this.handleReset}>
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}