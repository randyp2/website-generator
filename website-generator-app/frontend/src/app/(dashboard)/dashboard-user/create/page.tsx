"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";



import {
    FiZap,
    FiUpload,
    FiArrowRight,
    FiCheck,
    FiStar,
    FiCode,
    FiHeart,
    FiTrendingUp,
    FiBookOpen,
    FiUser,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { IconType } from "react-icons";
import { HeaderSection } from "./component/HeaderSection";
import { TemplateSection } from "./component/TemplateSection";


const TemplateGallery: React.FC = () => {
    const router = useRouter();
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    return (
        <div className="space-y-8 p-10">
            {/* Header */}
            <HeaderSection />

            {/* Template Grid */}
            <TemplateSection selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} />

            {/* Continue Button (appears after selection) */}
            <AnimatePresence>
                {selectedTemplate && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                                router.push(
                                    `/dashboard-user/create/upload?templateId=${selectedTemplate}`
                                )
                            }
                            className="hover:cursor-pointer px-8 py-4 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-full font-bold shadow-2xl shadow-sky-400/50 flex items-center gap-3"
                        >
                            Upload Documents
                            <FiArrowRight className="w-5 h-5" />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TemplateGallery;
