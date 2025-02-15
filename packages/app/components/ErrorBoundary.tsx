import * as React from "react";
import { PageError } from "packages/app/pages/PageError.tsx";

type ErrorProps = {
  fallback?: React.ReactNode | ((error?: Error) => React.ReactNode);
  children: React.ReactNode;
};

type ErrorState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<ErrorProps, ErrorState> {
  override state: ErrorState = {
    hasError: false,
    error: undefined,
  };
  override props: ErrorProps;

  constructor(props: ErrorProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  // Optionally log to PostHog
  override componentDidCatch(error: Error, info: unknown) {
    // You could also import posthog at the top, but here's a dynamic import to avoid overhead:
    try {
      import("posthog-js").then(({ posthog }) => {
        posthog.capture("client-error", {
          error: error?.message,
          stack: error?.stack,
          info,
        });
      });
    } catch (_) {
      // If posthog import fails, do nothing
    }
  }

  override render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback(this.state.error);
      }
      return this.props.fallback ?? <PageError error={this.state.error} />;
    }

    return this.props.children;
  }
}
