"use client";

import type { IconType } from "react-icons";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import {
    SiAngular,
    SiHtml5,
    SiNextdotjs,
    SiReact,
    SiVuedotjs,
} from "react-icons/si";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    buildSiteVerificationSnippet,
    findSiteVerificationFramework,
    SITE_VERIFICATION_FRAMEWORKS,
    type SiteVerificationFramework,
} from "../../lib/siteVerificationFrameworks";

const FRAMEWORK_ICONS: Record<SiteVerificationFramework, IconType> = {
    html: SiHtml5,
    react: SiReact,
    nextjs: SiNextdotjs,
    vue: SiVuedotjs,
    angular: SiAngular,
};

const codeLineColor = (line: string, frameworkColor: string): string => {
    const trimmedLine = line.trimStart();
    if (line.includes("webgen-site-verification")) return "#f2cc60";
    if (trimmedLine.startsWith("<")) return frameworkColor;
    if (/^(import|export|return)/.test(trimmedLine)) return "#ff7b72";
    return "#c9d1d9";
};

interface FrameworkPickerProps {
    framework: SiteVerificationFramework;
    onFrameworkChange: (framework: SiteVerificationFramework) => void;
}

/** Step 2 heading plus the framework selector, aligned to sit left of the code block. */
export const SiteVerificationFrameworkPicker = ({
    framework,
    onFrameworkChange,
}: FrameworkPickerProps) => {
    const frameworkGuide = findSiteVerificationFramework(framework);
    const FrameworkIcon = FRAMEWORK_ICONS[framework];

    return (
        <div className="flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                2
            </span>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                    Add it inside your head tag
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    Choose your framework to find the correct file.
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Framework</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label={`Selected framework: ${frameworkGuide.label}`}
                                className="flex min-w-36 cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <span className="flex size-5 items-center justify-center rounded bg-[#0d1117]">
                                    <FrameworkIcon
                                        className="size-3.5"
                                        style={{ color: frameworkGuide.accentColor }}
                                    />
                                </span>
                                <span>{frameworkGuide.label}</span>
                                <FiChevronDown className="ml-auto size-3.5 text-muted-foreground" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="min-w-44 border-slate-700 bg-[#161b22] p-1.5 text-slate-100"
                        >
                            {SITE_VERIFICATION_FRAMEWORKS.map((option) => {
                                const OptionIcon = FRAMEWORK_ICONS[option.id];
                                const selected = option.id === framework;
                                return (
                                    <DropdownMenuItem
                                        key={option.id}
                                        onSelect={() => onFrameworkChange(option.id)}
                                        className="cursor-pointer gap-2 rounded-md px-2 py-2 focus:bg-slate-700 focus:text-white"
                                    >
                                        <span className="flex size-6 items-center justify-center rounded bg-[#0d1117]">
                                            <OptionIcon
                                                className="size-4"
                                                style={{ color: option.accentColor }}
                                            />
                                        </span>
                                        <span>{option.label}</span>
                                        {selected && (
                                            <FiCheck className="ml-auto size-3.5 text-emerald-400" />
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};

interface CodeBlockProps {
    framework: SiteVerificationFramework;
    verificationTag: string;
}

/** Framework-specific entry-file example with the verification tag highlighted. */
export const SiteVerificationCodeBlock = ({
    framework,
    verificationTag,
}: CodeBlockProps) => {
    const frameworkGuide = findSiteVerificationFramework(framework);
    const FrameworkIcon = FRAMEWORK_ICONS[framework];
    const snippetLines = buildSiteVerificationSnippet(
        framework,
        verificationTag,
    ).split("\n");

    return (
        <div className="overflow-hidden rounded-lg border border-slate-700/70 bg-[#0d1117]">
            <div className="flex items-center gap-2 border-b border-slate-700/70 bg-[#161b22] px-3 py-2">
                <FrameworkIcon
                    className="size-3.5"
                    style={{ color: frameworkGuide.accentColor }}
                />
                <span className="font-mono text-[11px] text-slate-300">
                    {frameworkGuide.fileName}
                </span>
            </div>
            <pre className="max-h-72 overflow-auto p-4 text-xs leading-6">
                <code>
                    {snippetLines.map((line, index) => (
                        <span key={`${index}-${line}`} className="flex">
                            <span className="mr-4 w-5 shrink-0 select-none text-right text-slate-600">
                                {index + 1}
                            </span>
                            <span
                                style={{
                                    color: codeLineColor(
                                        line,
                                        frameworkGuide.accentColor,
                                    ),
                                }}
                            >
                                {line || " "}
                            </span>
                        </span>
                    ))}
                </code>
            </pre>
            <p className="border-t border-slate-700/70 px-4 py-2 text-[11px] leading-4 text-slate-400">
                {frameworkGuide.note} The tag must appear in the deployed page
                source.
            </p>
        </div>
    );
};
