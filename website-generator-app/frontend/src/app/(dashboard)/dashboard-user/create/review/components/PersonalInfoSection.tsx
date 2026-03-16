"use client";

import React from "react";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import type { ParsedResumeData } from "@/types/resume";
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
}) => (
    <ReviewSectionCard className="mb-6" delay={0.1}>
        <div className="text-center border-b border-white/10 pb-6 mb-6">
            {isEditing ? (
                <input
                    type="text"
                    value={parsedResumeData.fullName || ""}
                    onChange={(e) => updateFullName(e.target.value)}
                    className="text-4xl font-bold text-white text-center w-full bg-white/5 px-4 py-2 rounded-lg border-2 border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-400/20"
                    placeholder="Your Name"
                />
            ) : (
                <h2 className="text-4xl font-bold text-white">
                    {parsedResumeData.fullName || "Your Name"}
                </h2>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ContactField
                icon={<FiMail className="w-4 h-4 text-sky-400" />}
                label="Email"
                isEditing={isEditing}
                value={parsedResumeData.email || ""}
                placeholder="email@example.com"
                inputType="email"
                onChange={updateEmail}
                fallback="Not provided"
            />
            <ContactField
                icon={<FiPhone className="w-4 h-4 text-sky-400" />}
                label="Phone"
                isEditing={isEditing}
                value={parsedResumeData.phone || ""}
                placeholder="(123) 456-7890"
                inputType="tel"
                onChange={updatePhone}
                fallback="Not provided"
            />
            <ContactField
                icon={<FiMapPin className="w-4 h-4 text-sky-400" />}
                label="Location"
                isEditing={isEditing}
                value={parsedResumeData.location || ""}
                placeholder="City, State"
                inputType="text"
                onChange={updateLocation}
                fallback="Not provided"
            />
        </div>

        {(parsedResumeData.summary || isEditing) && (
            <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                    Summary
                </h3>
                {isEditing ? (
                    <textarea
                        value={parsedResumeData.summary || ""}
                        onChange={(e) => updateSummary(e.target.value)}
                        rows={3}
                        className="w-full text-slate-700 bg-white/5 px-4 py-3 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400 resize-none"
                        placeholder="Professional summary..."
                    />
                ) : (
                    <p className="text-slate-700 leading-relaxed">
                        {parsedResumeData.summary || "No summary provided"}
                    </p>
                )}
            </div>
        )}
    </ReviewSectionCard>
);

interface ContactFieldProps {
    fallback: string;
    icon: React.ReactNode;
    inputType: string;
    isEditing: boolean;
    label: string;
    onChange: (value: string) => void;
    placeholder: string;
    value: string;
}

const ContactField: React.FC<ContactFieldProps> = ({
    fallback,
    icon,
    inputType,
    isEditing,
    label,
    onChange,
    placeholder,
    value,
}) => (
    <div className="flex flex-col items-center p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {label}
            </span>
        </div>
        {isEditing ? (
            <input
                type={inputType}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="text-sm text-white text-center w-full bg-white/5 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-sky-400"
                placeholder={placeholder}
            />
        ) : (
            <p className="text-sm text-white font-medium">{value || fallback}</p>
        )}
    </div>
);
