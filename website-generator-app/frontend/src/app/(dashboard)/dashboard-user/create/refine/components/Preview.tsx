"use client";

import React, { useState, useEffect } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { atomDark } from "@codesandbox/sandpack-themes";

interface PreviewProps {
    previewHtml: string | null;
}

export const Preview: React.FC<PreviewProps> = ({ previewHtml }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="absolute inset-0 h-full w-full flex items-center justify-center bg-slate-900">
                <div className="text-slate-400">Loading editor...</div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 h-full w-full">
            <Sandpack
                files={{
                    "/App.js": `
import { motion } from "framer-motion";

export default function App() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ padding: 40 }}
    >
      <h1>Hello with animation</h1>
    </motion.div>
  );
}
  `,
                }}
                customSetup={{
                    dependencies: {
                        "framer-motion": "^10.0.0",
                    },
                }}
                theme={atomDark}
                template="react"
                options={{
                    showConsoleButton: true,
                    showInlineErrors: true,
                    showNavigator: true,
                    showLineNumbers: true,
                    showTabs: true,
                    editorHeight: "calc(100vh)",
                }}
            />
        </div>
    );
};
