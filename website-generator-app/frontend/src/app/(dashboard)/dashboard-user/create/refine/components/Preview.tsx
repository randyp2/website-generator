"use client";

import { DeviceMode } from "@/types/preview";
import { motion } from "framer-motion";
import React from "react";
import { FiMonitor, FiTablet, FiSmartphone } from "react-icons/fi";

interface PreviewProps {
    setDeviceMode: React.Dispatch<React.SetStateAction<DeviceMode>>;
    deviceMode: DeviceMode;
    getPreviewWidth: () => string;
}
export const Preview: React.FC<PreviewProps> = ({ setDeviceMode, deviceMode, getPreviewWidth}) => {
    return (
        <div className="absolute inset-0 bg-slate-100">
                <div className="h-full flex justify-center items-center">
                    {/* Device Mode Buttons - Floating Top Right */}
                    <div className="absolute top-6 right-6 flex gap-2 z-30">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeviceMode("desktop")}
                            className={`p-2 rounded-lg transition-all backdrop-blur-xl border ${
                                deviceMode === "desktop"
                                    ? "bg-sky-500 text-white shadow-md border-sky-600"
                                    : "bg-white/90 text-slate-600 hover:bg-white border-slate-200"
                            }`}
                            title="Desktop View"
                        >
                            <FiMonitor className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeviceMode("tablet")}
                            className={`p-2 rounded-lg transition-all backdrop-blur-xl border ${
                                deviceMode === "tablet"
                                    ? "bg-sky-500 text-white shadow-md border-sky-600"
                                    : "bg-white/90 text-slate-600 hover:bg-white border-slate-200"
                            }`}
                            title="Tablet View"
                        >
                            <FiTablet className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeviceMode("mobile")}
                            className={`p-2 rounded-lg transition-all backdrop-blur-xl border ${
                                deviceMode === "mobile"
                                    ? "bg-sky-500 text-white shadow-md border-sky-600"
                                    : "bg-white/90 text-slate-600 hover:bg-white border-slate-200"
                            }`}
                            title="Mobile View"
                        >
                            <FiSmartphone className="w-4 h-4" />
                        </motion.button>
                    </div>

                    {/* Preview Canvas */}
                    <motion.div
                        animate={{ width: getPreviewWidth() }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="bg-white rounded-lg shadow-2xl border border-slate-300  overflow-hidden h-full"
                    >
                        {/* Placeholder Portfolio Preview */}
                        <div className="h-full bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 flex flex-col items-center justify-center text-center space-y-6 p-12 overflow-auto">
                            <motion.div
                                animate={{ scale: [0.95, 1, 0.95] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="w-24 h-24 bg-linear-to-br from-sky-400 to-cyan-400 rounded-full"
                            />
                            <h1 className="text-4xl font-bold text-white">Your Name</h1>
                            <p className="text-slate-300 text-lg">Software Engineer</p>
                            <div className="flex flex-wrap gap-3 justify-center mt-8">
                                {["React", "TypeScript", "Node.js", "Python"].map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            <p className="text-slate-400 text-sm mt-12">
                                Preview updates in real-time
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
    );
}