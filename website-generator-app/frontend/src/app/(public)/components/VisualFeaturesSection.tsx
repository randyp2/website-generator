"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FileText, Sparkles, Globe, LucideIcon, User, Mail, Briefcase, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import React, { ReactNode } from 'react';

export function VisualFeaturesSection() {
    return (
        <section className="bg-[#030506] py-16 md:py-24">
            <div className="mx-auto max-w-2xl px-6 lg:max-w-6xl">
                <div className="mx-auto grid gap-6 lg:grid-cols-2">
                    {/* Resume Upload Card */}
                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={FileText}
                                title="Resume Upload"
                                description="Instantly parse and extract all professional details from your resume."
                            />
                        </CardHeader>

                        <div className="relative mb-6 border-t border-slate-800 overflow-hidden">
                            {/* Aurora Wave Background */}
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute bottom-0 left-0 right-0 h-64 bg-linear-to-t from-blue-600/20 via-blue-500/10 to-transparent blur-2xl"></div>
                                <div className="absolute bottom-0 left-1/4 right-0 h-48 bg-linear-to-t from-cyan-500/15 via-blue-400/10 to-transparent blur-3xl"></div>
                            </div>

                            <div className="relative aspect-76/59 p-6 flex items-center justify-center">
                                {/* Parsed Resume Mockup */}
                                <div className="w-full max-w-sm bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700 p-6 shadow-xl">
                                    {/* Header with Avatar */}
                                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-700">
                                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600">
                                            <User className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-slate-700 rounded w-32 mb-2"></div>
                                            <div className="h-3 bg-slate-800 rounded w-24"></div>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-slate-500" />
                                            <div className="h-2 bg-slate-800 rounded w-36"></div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-slate-500" />
                                            <div className="h-2 bg-slate-800 rounded w-28"></div>
                                        </div>
                                    </div>

                                    {/* Experience Section */}
                                    <div>
                                        <div className="text-xs text-slate-500 mb-3">EXPERIENCE</div>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="h-3 bg-slate-700 rounded w-40 mb-2"></div>
                                                <div className="h-2 bg-slate-800 rounded w-full mb-1"></div>
                                                <div className="h-2 bg-slate-800 rounded w-5/6"></div>
                                            </div>
                                            <div>
                                                <div className="h-3 bg-slate-700 rounded w-36 mb-2"></div>
                                                <div className="h-2 bg-slate-800 rounded w-full mb-1"></div>
                                                <div className="h-2 bg-slate-800 rounded w-4/6"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FeatureCard>

                    {/* AI Design Card */}
                    <FeatureCard>
                        <CardHeader className="pb-3">
                            <CardHeading
                                icon={Sparkles}
                                title="AI-Powered Design"
                                description="Prompt our AI to generate custom designs for your portfolio."
                            />
                        </CardHeader>

                        <CardContent>
                            <div className="relative mb-6">
                                <div className="aspect-76/59 border border-slate-800 rounded-lg overflow-hidden bg-slate-900/80 backdrop-blur-sm">
                                    {/* Chat/Prompt Interface Mockup */}
                                    <div className="h-full flex flex-col p-4">
                                        {/* Chat Messages */}
                                        <div className="flex-1 space-y-3 overflow-hidden">
                                            {/* User Message */}
                                            <div className="flex justify-end">
                                                <div className="bg-slate-800 rounded-lg p-3 max-w-[80%]">
                                                    <div className="h-2 bg-slate-700 rounded w-32 mb-1"></div>
                                                    <div className="h-2 bg-slate-700 rounded w-24"></div>
                                                </div>
                                            </div>

                                            {/* AI Response */}
                                            <div className="flex justify-start">
                                                <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-lg p-3 max-w-[80%] border border-slate-700">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Sparkles className="w-3 h-3 text-white" />
                                                        <div className="h-2 bg-slate-700 rounded w-20"></div>
                                                    </div>
                                                    {/* Design Preview Grid */}
                                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                                        <div className="aspect-square bg-slate-700 rounded border border-slate-600 flex items-center justify-center">
                                                            <div className="w-3 h-3 bg-slate-600 rounded-sm"></div>
                                                        </div>
                                                        <div className="aspect-square bg-slate-800 rounded border border-slate-700 flex items-center justify-center">
                                                            <div className="w-3 h-3 bg-slate-700 rounded-sm"></div>
                                                        </div>
                                                        <div className="aspect-square bg-slate-800 rounded border border-slate-700 flex items-center justify-center">
                                                            <div className="w-3 h-3 bg-slate-700 rounded-sm"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* User Message */}
                                            <div className="flex justify-end">
                                                <div className="bg-slate-800 rounded-lg p-3 max-w-[70%]">
                                                    <div className="h-2 bg-slate-700 rounded w-20"></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Input Area */}
                                        <div className="mt-3 pt-3 border-t border-slate-800">
                                            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2 border border-slate-700">
                                                <div className="flex-1 h-2 bg-slate-700 rounded"></div>
                                                <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
                                                    <Send className="w-4 h-4 text-slate-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </FeatureCard>

                    {/* Deployment Card */}
                    <FeatureCard className="p-6 lg:col-span-2">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mx-auto my-6 max-w-2xl text-balance text-center text-2xl font-semibold text-white"
                        >
                            Deploy instantly to Vercel, Netlify, or download your portfolio source code.
                        </motion.p>

                        <div className="flex justify-center gap-6 overflow-hidden flex-wrap">
                            <DeploymentOption
                                label="Vercel"
                                icon={Globe}
                                color="white"
                            />

                            <DeploymentOption
                                label="Netlify"
                                icon={Globe}
                                color="cyan"
                            />

                            <DeploymentOption
                                label="Download"
                                icon={FileText}
                                color="white"
                            />
                        </div>
                    </FeatureCard>
                </div>
            </div>
        </section>
    );
}

interface FeatureCardProps {
    children: ReactNode;
    className?: string;
}

const FeatureCard = ({ children, className }: FeatureCardProps) => (
    <Card className={cn('group relative rounded-lg shadow-2xl bg-slate-900/30 border-slate-800 backdrop-blur-sm', className)}>
        <CardDecorator />
        {children}
    </Card>
);

const CardDecorator = () => (
    <>
        <span className="absolute -left-px -top-px block size-2 border-l-2 border-t-2 border-white"></span>
        <span className="absolute -right-px -top-px block size-2 border-r-2 border-t-2 border-white"></span>
        <span className="absolute -bottom-px -left-px block size-2 border-b-2 border-l-2 border-white"></span>
        <span className="absolute -bottom-px -right-px block size-2 border-b-2 border-r-2 border-white"></span>
    </>
);

interface CardHeadingProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

const CardHeading = ({ icon: Icon, title, description }: CardHeadingProps) => (
    <div className="p-6">
        <span className="flex items-center gap-2 text-slate-400">
            <Icon className="size-4" />
            {title}
        </span>
        <p className="mt-8 text-2xl font-semibold text-white">{description}</p>
    </div>
);

interface DeploymentOptionProps {
    label: string;
    icon: LucideIcon;
    color: 'white' | 'cyan';
}

const DeploymentOption = ({ label, icon: Icon, color }: DeploymentOptionProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
    >
        <div className="bg-linear-to-b from-slate-700/50 to-transparent size-fit rounded-2xl p-px">
            <div className="bg-linear-to-b from-slate-900 to-slate-800/25 relative flex aspect-square w-fit items-center justify-center rounded-[15px] p-6">
                <Icon className={cn(
                    'size-8 sm:size-10',
                    color === 'cyan' ? 'text-cyan-400' : 'text-white'
                )} />
            </div>
        </div>
        <span className="mt-2 block text-center text-sm text-slate-400">{label}</span>
    </motion.div>
);
