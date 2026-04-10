"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiPlus, FiX, FiLoader } from "react-icons/fi";

interface ParsedResumeData {
    normalizedText?: string;
    skills?: string[];
    experiences?: {
        title?: string;
        company?: string;
        startDate?: string;
        endDate?: string;
        location?: string;
        bullets?: string[];
    }[];
    confidenceScore?: number;
    parsingMethod?: string;
}

interface SkillReviewPanelProps {
    parsedData: ParsedResumeData | null;
    isLoading: boolean;
    parsingError: string | null;
    onConfirm: (skills: string[], experiences: ParsedResumeData["experiences"]) => void;
}

const SkillReviewPanel = ({
    parsedData,
    isLoading,
    parsingError,
    onConfirm,
}: SkillReviewPanelProps) => {
    const [skills, setSkills] = useState<string[]>(parsedData?.skills ?? []);
    const [newSkill, setNewSkill] = useState("");
    const [experiences] = useState(parsedData?.experiences ?? []);

    // Sync skills when parsedData arrives after loading
    const [lastSyncedData, setLastSyncedData] = useState<ParsedResumeData | null>(null);
    if (parsedData && parsedData !== lastSyncedData) {
        setLastSyncedData(parsedData);
        if (skills.length === 0 && (parsedData.skills?.length ?? 0) > 0) {
            setSkills(parsedData.skills ?? []);
        }
    }

    const handleAddSkill = useCallback(() => {
        const trimmed = newSkill.trim();
        if (!trimmed) return;
        if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
        setSkills((prev) => [...prev, trimmed]);
        setNewSkill("");
    }, [newSkill, skills]);

    const handleRemoveSkill = useCallback((index: number) => {
        setSkills((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleAddSkill();
            }
        },
        [handleAddSkill],
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card p-12">
                <FiLoader className="h-8 w-8 animate-spin text-muted-foreground" />
                <div className="space-y-1 text-center">
                    <h3 className="text-lg font-semibold text-foreground">
                        Parsing your resume...
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Extracting skills and experience from your resume.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {parsingError ? (
                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                    <p className="text-sm text-yellow-200">{parsingError}</p>
                </div>
            ) : null}

            {parsedData?.confidenceScore !== undefined ? (
                <p className="text-xs text-muted-foreground">
                    Parsed via {parsedData.parsingMethod} (confidence:{" "}
                    {Math.round(parsedData.confidenceScore * 100)}%)
                </p>
            ) : null}

            {/* Skills */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">
                        Skills
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        We extracted these skills from your resume. Add any we
                        missed or remove incorrect ones.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                        <span
                            key={`${skill}-${index}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground"
                        >
                            {skill}
                            <button
                                onClick={() => handleRemoveSkill(index)}
                                className="rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
                            >
                                <FiX className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                    {skills.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                            No skills extracted. Add your skills below.
                        </p>
                    ) : null}
                </div>

                <div className="flex gap-2">
                    <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a skill and press Enter"
                        className="max-w-xs"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim()}
                    >
                        <FiPlus className="h-4 w-4 mr-1" />
                        Add
                    </Button>
                </div>
            </div>

            {/* Experience */}
            {experiences.length > 0 ? (
                <div className="rounded-xl border bg-card p-6 space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-foreground">
                            Work Experience
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Extracted from your resume. These will be
                            cross-referenced against your connected accounts.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {experiences.map((exp, index) => (
                            <div
                                key={index}
                                className="rounded-lg border bg-muted/50 p-4 space-y-1"
                            >
                                <div className="flex items-baseline justify-between">
                                    <h4 className="font-medium text-foreground">
                                        {exp.title || "Untitled Role"}
                                    </h4>
                                    <span className="text-xs text-muted-foreground">
                                        {[exp.startDate, exp.endDate]
                                            .filter(Boolean)
                                            .join(" - ")}
                                    </span>
                                </div>
                                {exp.company ? (
                                    <p className="text-sm text-muted-foreground">
                                        {exp.company}
                                        {exp.location
                                            ? ` · ${exp.location}`
                                            : ""}
                                    </p>
                                ) : null}
                                {exp.bullets && exp.bullets.length > 0 ? (
                                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                                        {exp.bullets.map((bullet, bi) => (
                                            <li key={bi}>{bullet}</li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Confirm */}
            <div className="rounded-xl border bg-card p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-foreground">
                            Ready to verify
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Confirm your skills and experience to start the
                            verification process.
                        </p>
                    </div>
                    <Button
                        onClick={() => onConfirm(skills, experiences)}
                        disabled={skills.length === 0}
                    >
                        Confirm &amp; Start Verification
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SkillReviewPanel;
