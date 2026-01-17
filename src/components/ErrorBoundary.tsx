import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 bg-black text-white p-8 overflow-auto z-[9999]">
                    <h1 className="text-xl text-red-500 font-bold mb-4">Application Crash Detected</h1>

                    <div className="bg-gray-900 p-4 rounded mb-4 border border-red-900">
                        <h2 className="text-white font-mono mb-2">{this.state.error?.toString()}</h2>
                        <details className="whitespace-pre-wrap text-xs text-gray-400 font-mono">
                            {this.state.errorInfo?.componentStack}
                        </details>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-white text-black rounded font-bold"
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
