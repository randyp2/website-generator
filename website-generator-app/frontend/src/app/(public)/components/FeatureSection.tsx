"use client";

import { motion } from "framer-motion";
import React from "react";
import { FiUpload, FiCpu, FiEye, FiDownload, FiFileText, FiZap, FiCheckCircle, FiSend, FiCode, FiMonitor, FiUser } from "react-icons/fi";

// Visual Component for Step 1 - Upload Interface with Drag Animation
const UploadVisual: React.FC = () => (
    <div className="relative flex h-full min-h-[350px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-linear-to-br from-card to-muted p-8">
        {/* Drop Zone Content */}
        <div className="text-center relative z-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20">
                <FiUpload className="w-10 h-10" />
            </div>
            <p className="mb-2 text-lg font-semibold text-card-foreground">Drop your resume here</p>
            <p className="mb-4 text-sm text-muted-foreground">or click to browse</p>
            <div className="flex gap-2 justify-center flex-wrap">
                <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">PDF</span>
                <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">DOCX</span>
                <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">TXT</span>
            </div>
        </div>

        {/* Animated File Being Dragged */}
        <div className="absolute top-8 right-8 z-20">
            <motion.div
                animate={{
                    y: [0, -8, 0],
                    rotate: [-2, 2, -2]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="rounded-lg border-2 border-primary/20 bg-background p-4 shadow-2xl"
            >
                <FiFileText className="mb-2 h-8 w-8 text-primary" />
                <div className="text-left">
                    <p className="text-xs font-semibold text-card-foreground">resume.pdf</p>
                    <p className="text-xs text-muted-foreground">2.4 MB</p>
                </div>
            </motion.div>
        </div>

        {/* Success indicator after drop */}
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 2, duration: 0.4 }}
            className="absolute bottom-4 left-4 bg-green-50 rounded-lg shadow-lg p-3 flex items-center gap-3 border-2 border-green-200"
        >
            <FiCheckCircle className="w-5 h-5 text-green-600" />
            <div className="text-left">
                <p className="text-xs font-semibold text-green-700">Upload successful!</p>
                <p className="text-xs text-green-600">Processing resume...</p>
            </div>
        </motion.div>
    </div>
);

// Visual Component for Step 2 - AI Chat/Prompting Interface
const AIProcessingVisual: React.FC = () => (
    <div className="relative h-full min-h-[400px] overflow-hidden rounded-2xl bg-linear-to-br from-card to-muted p-6">
        {/* Chat Interface Container */}
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-lg">
            {/* Chat Header */}
            <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <FiCpu className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold">AI Portfolio Assistant</h4>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-primary-foreground/80">Active</span>
                    </div>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {/* User Message 1 */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="flex justify-end"
                >
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground shadow-md">
                        <p className="text-xs leading-relaxed">
                            Make my bio more professional and highlight my leadership skills
                        </p>
                    </div>
                </motion.div>

                {/* AI Response 1 */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                    className="flex justify-start"
                >
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-muted px-4 py-2.5 text-card-foreground shadow-sm">
                        <div className="flex items-start gap-2 mb-2">
                            <FiZap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                            <p className="text-xs leading-relaxed">
                                I&apos;ve enhanced your bio to emphasize strategic leadership and team management. Here&apos;s the updated version:
                            </p>
                        </div>
                        <div className="rounded-lg border border-border bg-background p-2.5 text-xs">
                            <p className="italic leading-relaxed text-muted-foreground">
                                &quot;Visionary leader with 8+ years driving cross-functional teams...&quot;
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* User Message 2 */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                    className="flex justify-end"
                >
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-primary-foreground shadow-md">
                        <p className="text-xs leading-relaxed">
                            Perfect! Can you suggest better project descriptions?
                        </p>
                    </div>
                </motion.div>

                {/* AI Response 2 - Typing Indicator */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                    className="flex justify-start"
                >
                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-border bg-muted px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                            <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                className="w-2 h-2 bg-cyan-500 rounded-full"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                className="w-2 h-2 bg-cyan-500 rounded-full"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                className="w-2 h-2 bg-cyan-500 rounded-full"
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">Analyzing your projects...</span>
                    </div>
                </motion.div>
            </div>

            {/* Input Area */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.1, duration: 0.4 }}
                className="border-t border-border bg-card p-3"
            >
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                    <input
                        type="text"
                        placeholder="Ask AI to refine your portfolio..."
                        className="flex-1 bg-transparent text-xs text-card-foreground placeholder:text-muted-foreground outline-none"
                        disabled
                    />
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-sm">
                        <FiSend className="w-3.5 h-3.5 text-white" />
                    </div>
                </div>
            </motion.div>
        </div>

        {/* Floating AI Suggestions */}
        <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="absolute -left-2 top-1/4 max-w-[140px] rounded-lg border border-border bg-background p-2.5 shadow-xl"
        >
            <div className="flex items-start gap-2">
                <FiCheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                <div>
                    <p className="text-xs font-semibold text-card-foreground">Smart Suggestions</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">AI-powered refinements</p>
                </div>
            </div>
        </motion.div>
    </div>
);

// Visual Component for Step 3 - Customization
const CustomizationVisual: React.FC = () => (
    <div className="relative bg-linear-to-br from-cyan-50 to-teal-50 rounded-2xl p-6 h-full min-h-[300px]">
        {/* Mini Portfolio Preview */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200"
        >
            {/* Mock Browser Bar */}
            <div className="bg-slate-100 px-3 py-2 flex items-center gap-2 border-b border-slate-200">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-white rounded px-2 py-0.5 text-xs text-slate-500 flex items-center gap-1">
                    <FiMonitor className="w-3 h-3" />
                    yourportfolio.com
                </div>
            </div>

            {/* Mock Portfolio Content */}
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-linear-to-br from-cyan-400 to-teal-400 rounded-full flex items-center justify-center">
                        <FiUser className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="h-3 bg-slate-200 rounded w-24 mb-1.5"></div>
                        <div className="h-2 bg-slate-100 rounded w-32"></div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="h-2 bg-slate-200 rounded w-full"></div>
                    <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-2 bg-slate-200 rounded w-4/6"></div>
                </div>

                <div className="flex gap-2 pt-2">
                    <div className="h-6 bg-linear-to-r from-cyan-500 to-teal-500 rounded px-3 flex items-center text-xs text-white">
                        Project 1
                    </div>
                    <div className="h-6 bg-linear-to-r from-cyan-500 to-teal-500 rounded px-3 flex items-center text-xs text-white">
                        Project 2
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Color Picker Floating Panel */}
        <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute -right-2 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-3 border border-slate-200"
        >
            <p className="text-xs font-semibold text-slate-700 mb-2">Theme Colors</p>
            <div className="flex gap-2">
                <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="w-6 h-6 rounded-full bg-linear-to-br from-cyan-500 to-teal-500 border-2 border-white shadow-md cursor-pointer"
                />
                <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="w-6 h-6 rounded-full bg-linear-to-br from-purple-500 to-pink-500 border-2 border-slate-200 shadow-md cursor-pointer"
                />
                <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="w-6 h-6 rounded-full bg-linear-to-br from-orange-500 to-red-500 border-2 border-slate-200 shadow-md cursor-pointer"
                />
            </div>
        </motion.div>

        {/* Live Preview Badge */}
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="absolute bottom-4 left-4 bg-white rounded-full px-3 py-1.5 shadow-lg border border-emerald-200 flex items-center gap-2"
        >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-700">Live Preview</span>
        </motion.div>
    </div>
);

// Visual Component for Step 4 - Deploy
const DeployVisual: React.FC = () => (
    <div className="relative bg-linear-to-br from-cyan-50 to-teal-50 rounded-2xl p-8 h-full min-h-[300px] flex flex-col items-center justify-center">
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center relative z-10"
        >
            {/* Rocket/Deploy Icon */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto shadow-xl"
            >
                <FiZap className="w-10 h-10" />
            </motion.div>

            {/* URL Preview */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-blue-200"
            >
                <p className="text-xs text-slate-500 mb-2">Your portfolio is live at:</p>
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                    <FiCode className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-mono text-blue-600">yourname.portfolio.com</span>
                </div>
            </motion.div>

            {/* Deploy Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-linear-to-r from-blue-500 to-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-lg flex items-center gap-2 mx-auto"
            >
                <FiSend className="w-4 h-4" />
                Deploy Now
            </motion.button>
        </motion.div>

        {/* Success Checkmarks */}
        <div className="absolute bottom-4 right-4 space-y-2">
            {["SEO Optimized", "Mobile Ready", "Fast Loading"].map((text, i) => (
                <motion.div
                    key={i}
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                    className="bg-white rounded-full px-3 py-1 shadow-md border border-blue-100 flex items-center gap-2"
                >
                    <FiCheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-slate-700">{text}</span>
                </motion.div>
            ))}
        </div>

        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-400 rounded-full blur-3xl"
            />
        </div>
    </div>
);

const steps = [
    {
        step: "01",
        icon: <FiUpload className="w-7 h-7" />,
        title: "Upload Your Resume or Enter Details",
        description: "Simply upload your resume, LinkedIn profile, or manually enter your information.",
        visual: <UploadVisual />,
        highlights: [
            {
                icon: <FiFileText className="w-4 h-4" />,
                text: "Support for PDF, DOCX, and text formats"
            },
            {
                icon: <FiZap className="w-4 h-4" />,
                text: "Auto-extract experience, skills, and education"
            },
            {
                icon: <FiCheckCircle className="w-4 h-4" />,
                text: "No manual data entry required"
            }
        ],
        why: "Unlike other tools that force you to fill out endless forms, we intelligently parse your existing documents to save you time and ensure accuracy."
    },
    {
        step: "02",
        icon: <FiCpu className="w-7 h-7" />,
        title: "AI-Powered Content Generation",
        description: "Our advanced AI analyzes your background and crafts compelling, personalized content.",
        visual: <AIProcessingVisual />,
        highlights: [
            {
                icon: <FiZap className="w-4 h-4" />,
                text: "Context-aware prompting for better results"
            },
            {
                icon: <FiCheckCircle className="w-4 h-4" />,
                text: "Industry-specific language and tone"
            },
            {
                icon: <FiFileText className="w-4 h-4" />,
                text: "Highlights your unique strengths"
            }
        ],
        why: "Our proprietary prompting system doesn't just fill templates—it understands your career narrative and creates authentic, engaging content that truly represents you."
    },
    {
        step: "03",
        icon: <FiEye className="w-7 h-7" />,
        title: "Customize & Preview",
        description: "Fine-tune your portfolio with our intuitive editor and see changes in real-time.",
        visual: <CustomizationVisual />,
        highlights: [
            {
                icon: <FiZap className="w-4 h-4" />,
                text: "Live preview as you edit"
            },
            {
                icon: <FiCheckCircle className="w-4 h-4" />,
                text: "Multiple professional themes"
            },
            {
                icon: <FiFileText className="w-4 h-4" />,
                text: "Add custom sections and projects"
            }
        ],
        why: "Full creative control without the hassle. Adjust colors, layouts, and content while maintaining professional design standards automatically."
    },
    {
        step: "04",
        icon: <FiDownload className="w-7 h-7" />,
        title: "Deploy & Share",
        description: "Publish your portfolio instantly with a custom URL or download for your own hosting.",
        visual: <DeployVisual />,
        highlights: [
            {
                icon: <FiZap className="w-4 h-4" />,
                text: "One-click deployment to custom domain"
            },
            {
                icon: <FiCheckCircle className="w-4 h-4" />,
                text: "SEO-optimized and mobile-responsive"
            },
            {
                icon: <FiFileText className="w-4 h-4" />,
                text: "Share with a single link"
            }
        ],
        why: "No technical knowledge needed. Your portfolio is production-ready with optimal performance, SEO, and mobile support built in."
    }
];

export const FeatureSection: React.FC = () => {
    return (
        <section className="bg-transparent px-6 py-20 text-foreground">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
                        How It Works
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                        Four simple steps to create your professional portfolio.
                        No coding, no complexity—just results.
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-20">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            {/* Main Content Grid */}
                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Left Side - Visual Component */}
                                <div className={`${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'} h-[500px]`}>
                                    <div className="h-full">
                                        {step.visual}
                                    </div>
                                </div>

                                {/* Right Side - Details */}
                                <div className={`${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'} flex flex-col justify-start h-[500px] space-y-6`}>
                                    {/* Step Number & Title */}
                                    <div className="relative shrink-0">
                                        {/* Large Background Step Number - More visible */}
                                        <div className="mb-4 bg-linear-to-br from-primary to-[#3f73ff] bg-clip-text text-[180px] leading-none text-transparent opacity-20">
                                            {step.step}
                                        </div>

                                        <div className="absolute top-8 left-0 right-0">
                                            <h3 className="mb-4 text-3xl font-bold text-foreground lg:text-4xl">
                                                {step.title}
                                            </h3>
                                            <p className="text-lg text-muted-foreground">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Spacer to push highlights down */}
                                    <div className="grow min-h-20"></div>

                                    {/* Highlights */}
                                    <div className="shrink-0 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-md">
                                        {step.highlights.map((highlight, hIndex) => (
                                            <div key={hIndex} className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    {highlight.icon}
                                                </div>
                                                <span className="font-medium text-card-foreground">
                                                    {highlight.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Why it's better - Centered below both columns */}
                            <div className="mt-8 lg:mx-auto lg:max-w-4xl">
                                <div className="rounded-2xl border border-primary/15 bg-linear-to-br from-card to-muted p-6 shadow-md">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                            <span className="text-xs font-bold">!</span>
                                        </div>
                                        <div>
                                            <p className="mb-1.5 text-sm font-bold text-primary">
                                                WHY IT MATTERS
                                            </p>
                                            <p className="leading-relaxed text-card-foreground">
                                                {step.why}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Connecting Line (except for last step) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:flex justify-center my-12">
                                    <motion.div
                                        initial={{ scaleY: 0 }}
                                        whileInView={{ scaleY: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                        className="h-12 w-0.5 origin-top bg-linear-to-b from-primary/60 via-primary/30 to-transparent"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
