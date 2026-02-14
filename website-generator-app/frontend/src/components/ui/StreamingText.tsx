"use client";

import * as React from "react";

interface StreamingTextProps {
    content: string;
    className?: string;
    delayMs?: number; // Delay between each word in milliseconds
    skipAnimation?: boolean; // If true, show all text immediately
    onComplete?: () => void; // Callback when streaming finishes
}

export const StreamingText: React.FC<StreamingTextProps> = ({
    content,
    className = "",
    delayMs = 50,
    skipAnimation = false,
    onComplete,
}) => {
    const [displayedText, setDisplayedText] = React.useState(skipAnimation ? content : "");
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const hasCalledComplete = React.useRef(false);

    // Split content into words while preserving whitespace and newlines
    const words = React.useMemo(() => {
        // Split by spaces but keep the spaces
        const parts = content.split(/(\s+)/);
        return parts;
    }, [content]);

    React.useEffect(() => {
        // If skipAnimation is true, show all text immediately
        if (skipAnimation) {
            setDisplayedText(content);
            if (onComplete && !hasCalledComplete.current) {
                hasCalledComplete.current = true;
                onComplete();
            }
            return;
        }

        if (currentIndex < words.length) {
            const timeoutId = setTimeout(() => {
                setDisplayedText((prev) => prev + words[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, delayMs);

            return () => clearTimeout(timeoutId);
        } else if (currentIndex === words.length && onComplete && !hasCalledComplete.current) {
            // Streaming complete
            hasCalledComplete.current = true;
            onComplete();
        }
    }, [currentIndex, words, delayMs, skipAnimation, content, onComplete]);

    return <span className={className}>{displayedText}</span>;
};

StreamingText.displayName = "StreamingText";
