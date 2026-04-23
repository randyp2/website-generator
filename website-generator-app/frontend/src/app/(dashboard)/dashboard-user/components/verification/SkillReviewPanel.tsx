"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiPlus, FiX, FiLoader } from "react-icons/fi";

import type { ParsedExperience, ParsedResumeData } from "@/types/resume";

type Experience = ParsedExperience;

const formatRelativeTimestamp = (timestamp: string | null): string => {
    if (!timestamp) return "Not available";

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "Not available";

    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

// ─── Sub-components ───────────────────────────────────────────────────

interface SkillChipProps {
    skill: string;
    onRemove: () => void;
    canRemove: boolean;
}

const SkillChip = ({ skill, onRemove, canRemove }: SkillChipProps) => (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
        {skill}
        {canRemove ? (
            <button
                onClick={onRemove}
                className="rounded-full p-0.5 transition-colors hover:cursor-pointer hover:bg-destructive/20 hover:text-destructive"
            >
                <FiX className="h-3 w-3" />
            </button>
        ) : null}
    </span>
);

interface ExperienceItemProps {
    experience: Experience;
    onUpdate: (updates: Partial<Experience>) => void;
    canEdit: boolean;
}

const fieldClass =
    "bg-transparent border-0 border-b border-black dark:border-border focus:border-primary outline-none pb-0.5 transition-colors";

const ExperienceItem = ({
    experience,
    onUpdate,
    canEdit,
}: ExperienceItemProps) => {
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

    if (canEdit) {
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
    lastUpdatedAt: string | null;
    isLoading: boolean;
    parsingError: string | null;
    isIngesting: boolean;
    ingestError: string | null;
    onSave: (skills: string[], experiences: ParsedExperience[]) => void;
    onConfirm: (skills: string[], experiences: ParsedExperience[]) => void;
}

const SkillReviewPanel = ({
    parsedData,
    lastUpdatedAt,
    isLoading,
    parsingError,
    isIngesting,
    ingestError,
    onSave,
    onConfirm,
}: SkillReviewPanelProps) => {
    const [skills, setSkills] = useState<string[]>([]);
    const [hasEditedSkills, setHasEditedSkills] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const [isGlobalEditing, setIsGlobalEditing] = useState(false);

    const [editedExperiences, setEditedExperiences] = useState<Experience[]>([]);
    const [hasEditedExperiences, setHasEditedExperiences] = useState(false);

    const parsedSkills = useMemo(() => parsedData?.skills ?? [], [parsedData]);
    const effectiveSkills = hasEditedSkills ? skills : parsedSkills;

    const parsedExperiences = useMemo(() => parsedData?.experiences ?? [], [parsedData]);
    const effectiveExperiences = hasEditedExperiences ? editedExperiences : parsedExperiences;
    const lastUpdatedLabel = useMemo(
        () => formatRelativeTimestamp(lastUpdatedAt),
        [lastUpdatedAt],
    );

    const handleAddSkill = useCallback(() => {
        const trimmed = newSkill.trim();
        if (!trimmed) return;
        if (effectiveSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;
        const newSkills = [...(hasEditedSkills ? skills : parsedSkills), trimmed];
        setSkills(newSkills);
        setHasEditedSkills(true);
        setNewSkill("");
        onSave(newSkills, effectiveExperiences);
    }, [newSkill, effectiveSkills, hasEditedSkills, skills, parsedSkills, effectiveExperiences, onSave]);

    const handleRemoveSkill = useCallback((index: number) => {
        const newSkills = (hasEditedSkills ? skills : parsedSkills).filter((_, i) => i !== index);
        setSkills(newSkills);
        setHasEditedSkills(true);
        onSave(newSkills, effectiveExperiences);
    }, [hasEditedSkills, skills, parsedSkills, effectiveExperiences, onSave]);

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

    const handleToggleGlobalEdit = useCallback(() => {
        setIsGlobalEditing((prev) => {
            const next = !prev;
            if (!next) {
                onSave(effectiveSkills, effectiveExperiences);
            }
            return next;
        });
    }, [effectiveSkills, effectiveExperiences, onSave]);

    const editableCardClass = isGlobalEditing
        ? "rounded-xl border-2 border-t-0 border-r-0 border-zinc-300/90 border-l-[6px] border-l-zinc-300/90 dark:border-zinc-700 dark:border-l-zinc-700 bg-white dark:bg-card p-6"
        : "rounded-xl border-2 border-zinc-300/90 dark:border-zinc-700 bg-white dark:bg-card p-6 shadow-[0_0_0_1px_rgba(161,161,170,0.16),0_1px_1px_rgba(24,24,27,0.04)] dark:shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_1px_1px_rgba(0,0,0,0.22)]";

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

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    type="button"
                    size="sm"
                    variant={isGlobalEditing ? "default" : "outline"}
                    onClick={handleToggleGlobalEdit}
                    className="w-fit hover:cursor-pointer"
                >
                    {isGlobalEditing ? "Done Editing" : "Edit"}
                </Button>
                <p className="text-xs text-muted-foreground">
                    Last updated: {lastUpdatedLabel}
                </p>
            </div>

            {/* Skills */}
            <div className={`${editableCardClass} space-y-4`}>
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
                                canRemove={isGlobalEditing}
                                onRemove={() => handleRemoveSkill(index)}
                            />
                        ))
                    )}
                </div>
                {isGlobalEditing ? (
                    <div className="flex gap-2">
                        <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a skill and press Enter"
                            className="max-w-xs border-black dark:border-input"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddSkill}
                            disabled={!newSkill.trim()}
                            className="hover:cursor-pointer"
                        >
                            <FiPlus className="mr-1 h-4 w-4" /> Add
                        </Button>
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Turn on edit mode to add or remove skills.
                    </p>
                )}
            </div>

            {/* Work Experience */}
            {effectiveExperiences.length > 0 ? (
                <div className={`${editableCardClass} space-y-4`}>
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
                                canEdit={isGlobalEditing}
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
