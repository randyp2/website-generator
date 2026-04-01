"use client";

import React from "react";

interface Props {
    children: React.ReactNode;
    sectionIndex: number;
}

interface State {
    hasError: boolean;
}

/**
 * Isolates render failures to individual sections so a single
 * broken section doesn't take down the entire portfolio page.
 * Mirrors the ErrorBoundary behaviour from the backend HTML export.
 */
class SectionErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        console.error(
            `[SectionErrorBoundary] Section ${this.props.sectionIndex} crashed:`,
            error,
        );
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        padding: "2rem",
                        textAlign: "center",
                        opacity: 0.5,
                    }}
                >
                    <p style={{ fontSize: "0.875rem" }}>
                        This section could not be rendered.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default SectionErrorBoundary;
