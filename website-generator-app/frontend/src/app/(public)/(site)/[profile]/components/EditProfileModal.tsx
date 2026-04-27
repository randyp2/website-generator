"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
    BookOpen,
    BriefcaseBusiness,
    Building2,
    Github,
    Globe,
    GraduationCap,
    Linkedin,
    MapPin,
    type LucideIcon,
} from "lucide-react";
import { FiUser } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PublicProfileDTO } from "@/types/public-profile";

const BIO_MAX_LENGTH = 280;

export type EditableProfileFields = Pick<
    PublicProfileDTO,
    | "fullName"
    | "bio"
    | "jobTitle"
    | "company"
    | "school"
    | "degree"
    | "location"
    | "websiteUrl"
    | "linkedinUrl"
    | "githubUrl"
>;

interface EditProfileModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile: PublicProfileDTO;
    onSaved: (updated: EditableProfileFields) => void;
}

const getInitials = (name: string): string => {
    const parts = name.split(/\s+/).filter(Boolean);
    return parts
        .map((p) => p[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

const toNullable = (value: string): string | null => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

interface IconLabelProps {
    htmlFor: string;
    icon: LucideIcon;
    children: React.ReactNode;
}

const IconLabel = ({ htmlFor, icon: Icon, children }: IconLabelProps) => (
    <Label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-sm font-medium text-foreground"
    >
        <Icon className="h-3.5 w-3.5 text-foreground/70" />
        {children}
    </Label>
);

interface SectionHeaderProps {
    children: React.ReactNode;
}

const SectionHeader = ({ children }: SectionHeaderProps) => (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {children}
    </h3>
);

const EditProfileModal = ({
    open,
    onOpenChange,
    profile,
    onSaved,
}: EditProfileModalProps) => {
    const [fullName, setFullName] = useState(profile.fullName ?? "");
    const [bio, setBio] = useState(profile.bio ?? "");
    const [jobTitle, setJobTitle] = useState(profile.jobTitle ?? "");
    const [company, setCompany] = useState(profile.company ?? "");
    const [school, setSchool] = useState(profile.school ?? "");
    const [degree, setDegree] = useState(profile.degree ?? "");
    const [location, setLocation] = useState(profile.location ?? "");
    const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl ?? "");
    const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl ?? "");
    const [githubUrl, setGithubUrl] = useState(profile.githubUrl ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setFullName(profile.fullName ?? "");
            setBio(profile.bio ?? "");
            setJobTitle(profile.jobTitle ?? "");
            setCompany(profile.company ?? "");
            setSchool(profile.school ?? "");
            setDegree(profile.degree ?? "");
            setLocation(profile.location ?? "");
            setWebsiteUrl(profile.websiteUrl ?? "");
            setLinkedinUrl(profile.linkedinUrl ?? "");
            setGithubUrl(profile.githubUrl ?? "");
            setError(null);
        }
    }, [open, profile]);

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        setError(null);

        const payload = {
            fullName: fullName.trim(),
            bio: bio.trim(),
            jobTitle: jobTitle.trim(),
            company: company.trim(),
            school: school.trim(),
            degree: degree.trim(),
            location: location.trim(),
            websiteUrl: websiteUrl.trim(),
            linkedinUrl: linkedinUrl.trim(),
            githubUrl: githubUrl.trim(),
        };

        try {
            const response = await fetch("/api/profile/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "Failed to update profile");
            }

            onSaved({
                fullName: toNullable(payload.fullName),
                bio: toNullable(payload.bio),
                jobTitle: toNullable(payload.jobTitle),
                company: toNullable(payload.company),
                school: toNullable(payload.school),
                degree: toNullable(payload.degree),
                location: toNullable(payload.location),
                websiteUrl: toNullable(payload.websiteUrl),
                linkedinUrl: toNullable(payload.linkedinUrl),
                githubUrl: toNullable(payload.githubUrl),
            });
            onOpenChange(false);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to update profile",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const initials = getInitials(profile.fullName ?? profile.username);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Update how your profile appears to visitors.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        {profile.avatarUrl ? (
                            <Image
                                src={profile.avatarUrl}
                                alt={profile.username}
                                width={80}
                                height={80}
                                unoptimized
                                className="h-20 w-20 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                {initials ? (
                                    <span className="text-2xl font-bold text-muted-foreground">
                                        {initials}
                                    </span>
                                ) : (
                                    <FiUser className="h-8 w-8 text-muted-foreground" />
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled
                            className="w-fit opacity-70"
                        >
                            Change avatar
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            Coming soon
                        </span>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Basics */}
                    <section className="space-y-4">
                        <SectionHeader>Basics</SectionHeader>
                        <div className="space-y-2">
                            <Label htmlFor="edit-profile-full-name">
                                Full name
                            </Label>
                            <Input
                                id="edit-profile-full-name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your name"
                                disabled={isSaving}
                                maxLength={80}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="edit-profile-bio">Bio</Label>
                                <span className="text-xs text-muted-foreground">
                                    {bio.length}/{BIO_MAX_LENGTH}
                                </span>
                            </div>
                            <Textarea
                                id="edit-profile-bio"
                                value={bio}
                                onChange={(e) =>
                                    setBio(e.target.value.slice(0, BIO_MAX_LENGTH))
                                }
                                placeholder="Tell visitors about yourself"
                                rows={4}
                                disabled={isSaving}
                            />
                        </div>
                    </section>

                    {/* Work */}
                    <section className="space-y-4">
                        <SectionHeader>Work</SectionHeader>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <IconLabel
                                    htmlFor="edit-profile-job-title"
                                    icon={BriefcaseBusiness}
                                >
                                    Job title
                                </IconLabel>
                                <Input
                                    id="edit-profile-job-title"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    placeholder="e.g. Senior Designer"
                                    disabled={isSaving}
                                    maxLength={120}
                                />
                            </div>
                            <div className="space-y-2">
                                <IconLabel
                                    htmlFor="edit-profile-company"
                                    icon={Building2}
                                >
                                    Company
                                </IconLabel>
                                <Input
                                    id="edit-profile-company"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder="e.g. Acme Inc."
                                    disabled={isSaving}
                                    maxLength={120}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Education */}
                    <section className="space-y-4">
                        <SectionHeader>Education</SectionHeader>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <IconLabel
                                    htmlFor="edit-profile-degree"
                                    icon={BookOpen}
                                >
                                    Degree
                                </IconLabel>
                                <Input
                                    id="edit-profile-degree"
                                    value={degree}
                                    onChange={(e) => setDegree(e.target.value)}
                                    placeholder="e.g. BSc Computer Science"
                                    disabled={isSaving}
                                    maxLength={120}
                                />
                            </div>
                            <div className="space-y-2">
                                <IconLabel
                                    htmlFor="edit-profile-school"
                                    icon={GraduationCap}
                                >
                                    School
                                </IconLabel>
                                <Input
                                    id="edit-profile-school"
                                    value={school}
                                    onChange={(e) => setSchool(e.target.value)}
                                    placeholder="e.g. MIT"
                                    disabled={isSaving}
                                    maxLength={120}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Location */}
                    <section className="space-y-4">
                        <SectionHeader>Location</SectionHeader>
                        <div className="space-y-2">
                            <IconLabel
                                htmlFor="edit-profile-location"
                                icon={MapPin}
                            >
                                Where you&apos;re based
                            </IconLabel>
                            <Input
                                id="edit-profile-location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. New York, NY"
                                disabled={isSaving}
                                maxLength={120}
                            />
                        </div>
                    </section>

                    {/* Links */}
                    <section className="space-y-4">
                        <SectionHeader>Links</SectionHeader>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <IconLabel
                                    htmlFor="edit-profile-website"
                                    icon={Globe}
                                >
                                    Website
                                </IconLabel>
                                <Input
                                    id="edit-profile-website"
                                    type="url"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                    placeholder="https://yoursite.com"
                                    disabled={isSaving}
                                    maxLength={300}
                                />
                            </div>
                            <div className="space-y-2">
                                <IconLabel
                                    htmlFor="edit-profile-linkedin"
                                    icon={Linkedin}
                                >
                                    LinkedIn
                                </IconLabel>
                                <Input
                                    id="edit-profile-linkedin"
                                    type="url"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    placeholder="https://linkedin.com/in/you"
                                    disabled={isSaving}
                                    maxLength={300}
                                />
                            </div>
                            <div className="space-y-2">
                                <IconLabel
                                    htmlFor="edit-profile-github"
                                    icon={Github}
                                >
                                    GitHub
                                </IconLabel>
                                <Input
                                    id="edit-profile-github"
                                    type="url"
                                    value={githubUrl}
                                    onChange={(e) => setGithubUrl(e.target.value)}
                                    placeholder="https://github.com/you"
                                    disabled={isSaving}
                                    maxLength={300}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {error && (
                    <p className="text-xs text-destructive">{error}</p>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            void handleSave();
                        }}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileModal;
