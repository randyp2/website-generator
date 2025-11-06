import React, { useState } from "react";
import type { FormState } from "../../types/formTypes";
import { motion, AnimatePresence } from "framer-motion";
import { FiZap, FiMaximize2, FiMinimize2, FiX } from "react-icons/fi";

interface PreviewContainerProps {
    formData: FormState | null;
    showPreview: boolean;
    isLoading: boolean;
    generatedHTML?: string;
}

const PreviewContainer: React.FC<PreviewContainerProps> = ({
    formData,
    showPreview,
    isLoading,
    generatedHTML
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <>
            {/* Normal Preview Container */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 backdrop-blur-lg min-h-[600px] flex items-center justify-center relative"
            >
                {/* Fullscreen Button */}
                {showPreview && !isLoading && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        onClick={toggleFullscreen}
                        className="absolute top-4 right-4 z-10 p-3 bg-gray-800/80 hover:bg-gray-700 rounded-xl border border-gray-600 transition-all duration-300 hover:scale-110 group"
                        title="Fullscreen"
                    >
                        <FiMaximize2 className="text-xl text-gray-300 group-hover:text-green-400 transition-colors" />
                    </motion.button>
                )}

                <AnimatePresence mode="wait">
                    {!showPreview ? (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center"
                        >
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                <FiZap className="text-4xl text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-300 mb-3">
                                Your Preview Awaits
                            </h3>
                            <p className="text-gray-500">
                                Complete the form and click Generate to see your portfolio
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="ai-preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full"
                        >
                            <iframe
                                title="AI Preview"
                                srcDoc={generatedHTML}
                                sandbox="allow-scripts allow-same-origin"
                                className="w-full h-[600px] rounded-2xl border border-gray-700"
                            />

                            {generatedHTML && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="mt-6 px-5 py-2.5 bg-emerald-500/90 text-black font-semibold rounded-xl shadow-md hover:bg-emerald-400 transition-colors"
                                    onClick={() => {
                                        const newWindow = window.open("", "_blank");
                                        if (newWindow) {
                                            newWindow.document.write(generatedHTML);
                                            newWindow.document.close();
                                        } else {
                                            alert("Popup blocked! Please allow pop-ups for this site.");
                                        }
                                    }}
                                >
                                    View Fullscreen
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Fullscreen Mode */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
                        onClick={toggleFullscreen}
                    >
                        {/* Fullscreen Container */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="h-full w-full p-4 md:p-8 flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header with controls */}
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="flex justify-between items-center mb-4 px-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="ml-4 text-gray-400 text-sm font-medium">
                                        Portfolio Preview
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={toggleFullscreen}
                                        className="p-3 bg-gray-800/80 hover:bg-gray-700 rounded-xl border border-gray-600 transition-all duration-300 group"
                                        title="Exit Fullscreen"
                                    >
                                        <FiMinimize2 className="text-lg text-gray-300 group-hover:text-green-400 transition-colors" />
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={toggleFullscreen}
                                        className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl border border-red-500/50 transition-all duration-300 group"
                                        title="Close"
                                    >
                                        <FiX className="text-lg text-red-400 group-hover:text-red-300 transition-colors" />
                                    </motion.button>
                                </div>
                            </motion.div>

                            {/* Preview Content */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex-1 bg-linear-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl"
                            >
                                <iframe
                                    title="AI Preview Fullscreen"
                                    srcDoc={generatedHTML}
                                    sandbox="allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                                    className="w-full h-[calc(100vh-4rem)] rounded-xl overflow-auto border border-gray-800"
                                />

                                {generatedHTML && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="mt-6 px-5 py-2.5 bg-emerald-500/90 text-black font-semibold rounded-xl shadow-md hover:bg-emerald-400 transition-colors"
                                        onClick={() => {
                                            const newWindow = window.open("", "_blank");
                                            if (newWindow) {
                                                newWindow.document.write(generatedHTML);
                                                newWindow.document.close();
                                            } else {
                                                alert("Popup blocked! Please allow pop-ups for this site.");
                                            }
                                        }}
                                    >
                                        View Fullscreen
                                    </motion.button>
                                )}
                            </motion.div>


                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PreviewContainer;