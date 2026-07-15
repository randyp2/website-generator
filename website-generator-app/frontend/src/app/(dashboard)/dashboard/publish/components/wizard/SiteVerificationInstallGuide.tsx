"use client";

import type { IconType } from "react-icons";
import { FiCheck, FiChevronDown, FiInfo } from "react-icons/fi";
import { SiAngular, SiHtml5, SiReact, SiVuedotjs } from "react-icons/si";
import { TbBrandNextjs } from "react-icons/tb";

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
import { HighlightedCode } from "./CodeHighlight";

const FRAMEWORK_ICONS: Record<SiteVerificationFramework, IconType> = {
    html: SiHtml5,
    react: SiReact,
    nextjs: TbBrandNextjs,
    vue: SiVuedotjs,
    angular: SiAngular,
};

interface FrameworkPickerProps {
    framework: SiteVerificationFramework;
    onFrameworkChange: (framework: SiteVerificationFramework) => void;
}

/** Framework selector row that drives which entry-file example is shown. */
export const SiteVerificationFrameworkPicker = ({
    framework,
    onFrameworkChange,
}: FrameworkPickerProps) => {
    const frameworkGuide = findSiteVerificationFramework(framework);
    const FrameworkIcon = FRAMEWORK_ICONS[framework];

    return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        aria-label={`Selected framework: ${frameworkGuide.label}`}
                        className="flex min-w-36 cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <span className="flex size-5 items-center justify-center rounded bg-muted">
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
                    className="min-w-44 border-border bg-popover p-1.5 text-popover-foreground"
                >
                    {SITE_VERIFICATION_FRAMEWORKS.map((option) => {
                        const OptionIcon = FRAMEWORK_ICONS[option.id];
                        const selected = option.id === framework;
                        return (
                            <DropdownMenuItem
                                key={option.id}
                                onSelect={() => onFrameworkChange(option.id)}
                                className="cursor-pointer gap-2 rounded-md px-2 py-2 focus:bg-accent focus:text-accent-foreground"
                            >
                                <span className="flex size-6 items-center justify-center rounded bg-muted">
                                    <OptionIcon
                                        className="size-4"
                                        style={{ color: option.accentColor }}
                                    />
                                </span>
                                <span>{option.label}</span>
                                {selected && (
                                    <FiCheck className="ml-auto size-3.5 text-emerald-500" />
                                )}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
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
        <div className="space-y-2">
            <div className="overflow-hidden rounded-lg border border-border bg-muted">
                <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2">
                    <FrameworkIcon
                        className="size-3.5"
                        style={{ color: frameworkGuide.accentColor }}
                    />
                    <span className="font-mono text-[11px] text-muted-foreground">
                        {frameworkGuide.fileName}
                    </span>
                </div>
                <pre className="max-h-56 overflow-auto p-4 text-xs leading-6 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2">
                    <code>
                        {snippetLines.map((line, index) => (
                            <span key={`${index}-${line}`} className="flex">
                                <span className="mr-4 w-5 shrink-0 select-none text-right text-muted-foreground/40">
                                    {index + 1}
                                </span>
                                <span>
                                    {line ? (
                                        <HighlightedCode line={line} />
                                    ) : (
                                        " "
                                    )}
                                </span>
                            </span>
                        ))}
                    </code>
                </pre>
            </div>
            <p className="flex items-start gap-1.5 px-1 text-[11px] leading-4 text-muted-foreground">
                <FiInfo className="mt-0.5 size-3.5 shrink-0" />
                <span>
                    {frameworkGuide.note} The tag must appear in the deployed
                    page source.
                </span>
            </p>
        </div>
    );
};
