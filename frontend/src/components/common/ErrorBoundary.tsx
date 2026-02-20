import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/dashboard';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950">
                    <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 mb-6">
                            <AlertTriangle size={32} />
                        </div>

                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Something went wrong</h1>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                            An unexpected error occurred in the application UI. We've been notified and are looking into it.
                        </p>

                        {import.meta.env.DEV && (
                            <div className="mb-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-md text-left overflow-auto max-h-40">
                                <p className="text-xs font-mono text-zinc-800 dark:text-zinc-200">
                                    {this.state.error?.toString()}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <Button onClick={this.handleReset} className="w-full">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reload Application
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => window.history.back()}
                                className="w-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                            >
                                Go Back
                            </Button>
                        </div>
                    </div>

                    <p className="mt-8 text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-medium">
                        TradeMatrix Enterprise MIS
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
