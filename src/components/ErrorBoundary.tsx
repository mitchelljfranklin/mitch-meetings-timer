import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unhandled error in Meeting Timer:", error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="app-error" role="alert">
          <h2>Something went wrong</h2>
          <p>The timer hit an unexpected error. Try reopening the app.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
