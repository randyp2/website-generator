"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiPlus, FiX, FiLoader } from "react-icons/fi";

import type { ParsedExperience, ParsedResumeData } from "@/types/resume";

type Experience = ParsedExperience;

// ─── Sub-components ───────────────────────────────────────────────────

interface SkillChipProps {
    skill: string;
    onRemove: () => void;
}

const SkillChip = ({ skill, onRemove }: SkillChipProps) => (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
        {skill}
        <button
            onClick={onRemove}
            className="rounded-full p-0.5 transition-colors hover:cursor-pointer hover:bg-destructive/20 hover:text-destructive"
        >
            <FiX className="h-3 w-3" />
        </button>
    </span>
);

interface ExperienceItemProps {
    experience: Experience;
    onUpdate: (updates: Partial<Experience>) => void;
}

const fieldClass =
    "bg-transparent border-b border-border focus:border-primary outline-none pb-0.5 transition-colors";

const ExperienceItem = ({ experience, onUpdate }: ExperienceItemProps) => {
    const [isEditing, setIsEditing] = useState(false);

    const updateBullet = (i: number, value: string) => {
        const bullets = [...(experience.bullets ?? [])];
        bullets[i] = value;
        onUpdate({ bullets });
    };

    const removeBullet = (i: number) =>
        onUpdate({ bullets: (experience.bullets ?? []).filter((_, idx) => idx !== i) });

    const addBullet = () =>
        onUpdate({ bullets: [...(experience.bullets ?? []), ""] });

    const dateLabel = [experience.startDate, experience.endDate].filter(Boolean).join(" – ");

    if (isEditing) {
        return (
            <div className="border-l-2 border-primary/25 pl-4 space-y-2">
                <input
                    value={experience.title ?? ""}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    placeholder="Role title"
                    className={`${fieldClass} w-full text-sm font-medium text-foreground`}
                />
                <input
                    value={experience.company ?? ""}
                    onChange={(e) => onUpdate({ company: e.target.value })}
                    placeholder="Company"
                    className={`${fieldClass} w-full text-sm text-muted-foreground`}
                />
                <div className="flex items-center gap-2">
                    <input
                        value={experience.startDate ?? ""}
                        onChange={(e) => onUpdate({ startDate: e.target.value })}
                        placeholder="Start date"
                        className={`${fieldClass} w-28 text-xs font-medium text-primary`}
                    />
                    <span className="text-xs text-muted-foreground">–</span>
                    <input
                        value={experience.endDate ?? ""}
                        onChange={(e) => onUpdate({ endDate: e.target.value })}
                        placeholder="End date"
                        className={`${fieldClass} w-28 text-xs font-medium text-primary`}
                    />
                </div>

                <div className="space-y-1.5 pt-1">
                    {(experience.bullets ?? []).map((bullet, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="shrink-0 text-xs text-muted-foreground/50">·</span>
                            <input
                                value={bullet}
                                onChange={(e) => updateBullet(i, e.target.value)}
                                className={`${fieldClass} flex-1 text-sm text-muted-foreground`}
                            />
                            <button
                                onClick={() => removeBullet(i)}
                                className="shrink-0 text-muted-foreground transition-colors hover:cursor-pointer hover:text-destructive"
                            >
                                <FiX className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addBullet}
                        className="flex items-center gap-1 text-xs text-primary hover:cursor-pointer"
                    >
                        <FiPlus className="h-3 w-3" /> Add bullet
                    </button>
                </div>

                <button
                    onClick={() => setIsEditing(false)}
                    className="pt-1 text-xs font-medium text-primary hover:cursor-pointer"
                >
                    Done
                </button>
            </div>
        );
    }

    return (
        <div className="border-l-2 border-primary/25 pl-4 space-y-0.5">
            <div className="flex items-baseline justify-between">
                <h4 className="font-medium text-foreground">
                    {experience.title || "Untitled Role"}
                </h4>
                <div className="ml-4 flex shrink-0 items-center gap-3">
                    <span className="text-xs font-medium text-primary">{dateLabel}</span>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-muted-foreground transition-colors hover:cursor-pointer hover:text-foreground"
                    >
                        Edit
                    </button>
                </div>
            </div>
            {experience.company ? (
                <p className="text-sm text-muted-foreground">
                    {experience.company}
                    {experience.location ? ` · ${experience.location}` : ""}
                </p>
            ) : null}
            {experience.bullets && experience.bullets.length > 0 ? (
                <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {experience.bullets.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
};

// ─── Main panel ───────────────────────────────────────────────────────

interface SkillReviewPanelProps {
    parsedData: ParsedResumeData | null;
    isLoading: boolean;
    parsingError: string | null;
    isIngesting: boolean;
    ingestError: string | null;
    onConfirm: (skills: string[], experiences: ParsedExperience[]) => void;
}

const SkillReviewPanel = ({
    parsedData,
    isLoading,
    parsingError,
    isIngesting,
    ingestError,
    onConfirm,
}: SkillReviewPanelProps) => {
    const [skills, setSkills] = useState<string[]>([]);
    const [hasEditedSkills, setHasEditedSkills] = useState(false);
    const [newSkill, setNewSkill] = useState("");

    const [editedExperiences, setEditedExperiences] = useState<Experience[]>([]);
    const [hasEditedExperiences, setHasEditedExperiences] = useState(false);

    const parsedSkills = useMemo(() => parsedData?.skills ?? [], [parsedData]);
    const effectiveSkills = hasEditedSkills ? skills : parsedSkills;

    const parsedExperiences = useMemo(() => parsedData?.experiences ?? [], [parsedData]);
    const effectiveExperiences = hasEditedExperiences ? editedExperiences : parsedExperiences;

    const handleAddSkill = useCallback(() => {
        const trimmed = newSkill.trim();
        if (!trimmed) return;
        if (effectiveSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
        setSkills([...(hasEditedSkills ? skills : parsedSkills), trimmed]);
        setHasEditedSkills(true);
        setNewSkill("");
    }, [newSkill, effectiveSkills, hasEditedSkills, skills, parsedSkills]);

    const handleRemoveSkill = useCallback((index: number) => {
        setSkills((hasEditedSkills ? skills : parsedSkills).filter((_, i) => i !== index));
        setHasEditedSkills(true);
    }, [hasEditedSkills, skills, parsedSkills]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); }
        },
        [handleAddSkill],
    );

    const updateExperience = useCallback(
        (index: number, updates: Partial<Experience>) => {
            const base = hasEditedExperiences ? editedExperiences : parsedExperiences;
            setEditedExperiences(base.map((exp, i) => (i === index ? { ...exp, ...updates } : exp)));
            setHasEditedExperiences(true);
        },
        [hasEditedExperiences, editedExperiences, parsedExperiences],
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-card p-12">
                <FiLoader className="h-8 w-8 animate-spin text-muted-foreground" />
                <div className="space-y-1 text-center">
                    <h3 className="text-lg font-semibold text-foreground">Parsing your resume...</h3>
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
                    <h3 className="text-lg font-semibold text-primary">Skills</h3>
                    <p className="text-sm text-muted-foreground">
                        We extracted these skills from your resume. Add any we missed or remove incorrect ones.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {effectiveSkills.length === 0 ? (
                        <p className="text-sm italic text-muted-foreground">
                            No skills extracted. Add your skills below.
                        </p>
                    ) : (
                        effectiveSkills.map((skill, index) => (
                            <SkillChip
                                key={`${skill}-${index}`}
                                skill={skill}
                                onRemove={() => handleRemoveSkill(index)}
                            />
                        ))
                    )}
                </div>
                <div className="flex gap-2">
                    <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a skill and press Enter"
                        className="max-w-xs"
                    />
                    <Button variant="outline" size="sm" onClick={handleAddSkill} disabled={!newSkill.trim()}>
                        <FiPlus className="mr-1 h-4 w-4" /> Add
                    </Button>
                </div>
            </div>

            {/* Work Experience */}
            {effectiveExperiences.length > 0 ? (
                <div className="rounded-xl border bg-card p-6 space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-primary">Work Experience</h3>
                        <p className="text-sm text-muted-foreground">
                            Extracted from your resume. These will be cross-referenced against your connected accounts.
                        </p>
                    </div>
                    <div className="space-y-4">
                        {effectiveExperiences.map((exp, index) => (
                            <ExperienceItem
                                key={index}
                                experience={exp}
                                onUpdate={(updates) => updateExperience(index, updates)}
                            />
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Confirm */}
            <div className="rounded-xl border bg-card p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-foreground">Ready to verify</h3>
                        <p className="text-sm text-muted-foreground">
                            Confirm your skills and experience to start the verification process.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Button
                            onClick={() => onConfirm(effectiveSkills, effectiveExperiences)}
                            disabled={effectiveSkills.length === 0 || isIngesting}
                            className="hover:cursor-pointer"
                        >
                            {isIngesting ? "Saving skills..." : "Confirm & Start Verification"}
                        </Button>
                        {ingestError ? (
                            <p className="max-w-xs text-right text-xs text-destructive">{ingestError}</p>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkillReviewPanel;
