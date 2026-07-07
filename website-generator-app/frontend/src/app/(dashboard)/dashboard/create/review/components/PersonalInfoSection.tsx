"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
    Github,
    Globe,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Phone,
} from "lucide-react";
import type { ParsedResumeData } from "@/types/resume";
import { cn } from "@/lib/utils";
import { useProfileMeQuery } from "@/hooks/useProfileMeQuery";
import { ReviewSectionCard } from "./ReviewSectionCard";

interface PersonalInfoSectionProps {
    isEditing: boolean;
    parsedResumeData: ParsedResumeData;
    updateFullName: (value: string) => void;
    updateEmail: (value: string) => void;
    updatePhone: (value: string) => void;
    updateLocation: (value: string) => void;
    updateSummary: (value: string) => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
    isEditing,
    parsedResumeData,
    updateFullName,
    updateEmail,
    updatePhone,
    updateLocation,
    updateSummary,
}) => {
    const [socialLinks, setSocialLinks] = useState([
        { platform: "GitHub", value: "github.com/username", icon: Github },
        { platform: "LinkedIn", value: "linkedin.com/in/username", icon: Linkedin },
        { platform: "Instagram", value: "instagram.com/username", icon: Instagram },
        { platform: "Website", value: "yourwebsite.com", icon: Globe },
    ]);

    const { data: profile } = useProfileMeQuery();
    const avatarUrl = profile?.avatarUrl?.trim() || null;

    const initials = (parsedResumeData.fullName || "YN")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((value) => value[0]?.toUpperCase())
        .join("");

    return (
        <ReviewSectionCard className="mb-6 overflow-hidden" delay={0.1}>
            <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt={parsedResumeData.fullName || "Profile picture"}
                        width={112}
                        height={112}
                        unoptimized
                        className="h-28 w-28 shrink-0 rounded-full border-4 border-border dark:border-white/10 object-cover shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_12px_32px_rgba(255,255,255,0.05)]"
                    />
                ) : (
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-border dark:border-white/10 bg-muted dark:bg-black/80 text-3xl font-bold text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_12px_32px_rgba(255,255,255,0.05)]">
                        {initials || "YN"}
                    </div>
                )}

                <div className="flex-1 text-center md:text-left">
                    {isEditing ? (
                        <input
                            type="text"
                            value={parsedResumeData.fullName || ""}
                            onChange={(e) => updateFullName(e.target.value)}
                            className={fieldClassName(
                                "mb-3 text-center md:text-left text-3xl font-bold",
                            )}
                            placeholder="Your Name"
                        />
                    ) : (
                        <h2 className="mb-2 text-3xl font-bold text-foreground">
                            {parsedResumeData.fullName || "Your Name"}
                        </h2>
                    )}

                    <p className="mb-4 text-sm font-medium text-primary/80">
                        Professional Title
                    </p>

                    <div className="flex flex-wrap gap-x-5 gap-y-3 justify-center md:justify-start text-sm text-foreground/80">
                        <ContactPill
                            icon={Mail}
                            label="Email"
                            isEditing={isEditing}
                            value={parsedResumeData.email || ""}
                            placeholder="email@example.com"
                            inputType="email"
                            onChange={updateEmail}
                            fallback="Not provided"
                        />
                        <ContactPill
                            icon={Phone}
                            label="Phone"
                            isEditing={isEditing}
                            value={parsedResumeData.phone || ""}
                            placeholder="(123) 456-7890"
                            inputType="tel"
                            onChange={updatePhone}
                            fallback="Not provided"
                        />
                        <ContactPill
                            icon={MapPin}
                            label="Location"
                            isEditing={isEditing}
                            value={parsedResumeData.location || ""}
                            placeholder="City, State"
                            inputType="text"
                            onChange={updateLocation}
                            fallback="Not provided"
                        />
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3 justify-center md:justify-start">
                        {socialLinks.map((link, index) => (
                            <div
                                key={link.platform}
                                className="flex items-center gap-2"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border dark:border-white/10 bg-muted dark:bg-black/70 text-foreground/90 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
                                    <link.icon className="h-4 w-4 text-primary" />
                                </div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={link.value}
                                        onChange={(e) =>
                                            setSocialLinks((current) =>
                                                current.map((item, itemIndex) =>
                                                    itemIndex === index
                                                        ? {
                                                              ...item,
                                                              value: e.target.value,
                                                          }
                                                        : item,
                                                ),
                                            )
                                        }
                                        className="min-w-40 border-b border-border dark:border-white/10 bg-transparent pb-1 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                                        aria-label={link.platform}
                                    />
                                ) : (
                                    <span className="text-sm text-foreground/80">
                                        {link.value}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {(parsedResumeData.summary || isEditing) && (
                <div className="relative mt-8 border-t border-border dark:border-white/10 pt-8">
                    <SectionTitle title="Professional Summary" />
                    {isEditing ? (
                        <textarea
                            value={parsedResumeData.summary || ""}
                            onChange={(e) => updateSummary(e.target.value)}
                            rows={5}
                            className={fieldClassName("min-h-32 resize-none leading-relaxed")}
                            placeholder="Professional summary..."
                        />
                    ) : (
                        <p className="text-foreground/80 leading-8 text-[15px]">
                            {parsedResumeData.summary || "No summary provided"}
                        </p>
                    )}
                </div>
            )}
        </ReviewSectionCard>
    );
};

interface ContactPillProps {
    fallback: string;
    icon: React.ElementType;
    inputType: string;
    isEditing: boolean;
    label: string;
    onChange: (value: string) => void;
    placeholder: string;
    value: string;
}

const ContactPill: React.FC<ContactPillProps> = ({
    fallback,
    icon,
    inputType,
    isEditing,
    label,
    onChange,
    placeholder,
    value,
}) => (
    <div className="flex items-center gap-2 text-foreground/80">
        {React.createElement(icon, {
            className: "h-4 w-4 shrink-0 text-muted-foreground",
        })}
        {isEditing ? (
            <input
                type={inputType}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="min-w-36 border-b border-border dark:border-white/10 bg-transparent pb-1 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                placeholder={placeholder}
                aria-label={label}
            />
        ) : (
            <p className="text-sm">{value || fallback}</p>
        )}
    </div>
);

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <div className="mb-4 flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-primary" />
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
    </div>
);

const fieldClassName = (className?: string) =>
    cn(
        "w-full rounded-2xl border border-border dark:border-white/10 bg-muted/50 dark:bg-white/[0.04] px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10",
        className,
    );
