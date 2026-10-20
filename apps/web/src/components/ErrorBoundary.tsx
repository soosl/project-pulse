import { Component, type ErrorInfo, type ReactNode } from "react";

import { ErrorState } from "./ErrorState";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unexpected application error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-dvh items-center justify-center bg-slate-50 p-4">
          <div className="w-full max-w-lg">
            <ErrorState
              title="Что-то пошло не так"
              message="Попробуйте перезагрузить страницу."
              errorBtnText="Перезагрузить страницу"
              handleErrorBtnClick={() => window.location.reload()}
            />
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
