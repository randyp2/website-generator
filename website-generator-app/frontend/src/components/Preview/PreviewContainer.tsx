import React from "react";
import type { FormState } from "../../types/formTypes";
import { motion, AnimatePresence } from "framer-motion";
import { FiZap } from "react-icons/fi";
import PreviewSections from "./PreviewSections";

interface PreviewContainerProps {
    formData: FormState | null;
    showPreview: boolean;
    isLoading: boolean;
}

const PreviewContainer: React.FC<PreviewContainerProps> = ({ formData, showPreview, isLoading }) => {

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700 backdrop-blur-lg min-h-[600px] flex items-center justify-center"
        >
            <AnimatePresence mode="wait">
                {/* Placeholder before preview */}
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
                    <PreviewSections formData={formData} isLoading={isLoading} />
                )}
            </AnimatePresence>
        </motion.div>
    );

}

export default PreviewContainer;