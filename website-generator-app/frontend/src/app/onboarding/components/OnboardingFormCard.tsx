import { motion } from "framer-motion";
import {
    AlignLeft,
    BookOpen,
    BriefcaseBusiness,
    Building2,
    Github,
    Globe,
    GraduationCap,
    Linkedin,
    Loader2,
    MapPin,
    type LucideIcon,
} from "lucide-react";
import { type ChangeEvent, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { BIO_MAX_LENGTH } from "../constants";
import { type FormState, type UsernameState } from "../types";
import OnboardingShell from "./OnboardingShell";

type OnboardingFormCardProps = {
    form: FormState;
    usernameState: UsernameState;
    usernameHelper: string;
    usernamePreview: string;
    siteHost: string;
    bioLength: number;
    submitError: string | null;
    isSubmitting: boolean;
    canSubmit: boolean;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onFieldChange: (
        field: keyof FormState,
    ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onUsernameChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

type FieldLabelProps = {
    htmlFor: string;
    label: string;
    icon: LucideIcon;
};

type SimpleLabelProps = {
    htmlFor: string;
    label: string;
};

const iconCircleClassName =
    "inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f59e0b]/18 text-[#f59e0b] dark:bg-[#fb923c]/20 dark:text-[#fdba74]";
const inputClassName = "h-12 text-base";

const SimpleLabel = ({ htmlFor, label }: SimpleLabelProps) => (
    <Label
        htmlFor={htmlFor}
        className="inline-flex items-center text-[0.95rem] font-medium text-foreground"
    >
        {label}
    </Label>
);

const FieldLabel = ({ htmlFor, label, icon: Icon }: FieldLabelProps) => (
    <Label
        htmlFor={htmlFor}
        className="inline-flex items-center gap-2 text-[0.95rem] font-medium text-foreground"
    >
        <span className={iconCircleClassName}>
            <Icon className="h-4 w-4" />
        </span>
        {label}
    </Label>
);

const OnboardingFormCard = ({
    form,
    usernameState,
    usernameHelper,
    usernamePreview,
    siteHost,
    bioLength,
    submitError,
    isSubmitting,
    canSubmit,
    onSubmit,
    onFieldChange,
    onUsernameChange,
}: OnboardingFormCardProps) => (
    <OnboardingShell containerClassName="flex items-center px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto w-full max-w-5xl"
        >
            <Card className="border-border/80 bg-card/95 shadow-xl shadow-primary/5 backdrop-blur">
                <CardHeader className="space-y-4">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        Step 1 of 1
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                        <div className="h-full w-full rounded-full bg-primary transition-all" />
                    </div>
                    <CardTitle className="text-3xl tracking-tight sm:text-4xl">
                        Let&apos;s shape your public profile
                    </CardTitle>
                    <CardDescription className="text-base">
                        Minimal setup, quick win. Pick a username and add a few details.
                    </CardDescription>
                    <p className="text-sm text-muted-foreground">
                        Public URL preview:
                        {" "}
                        <span className="font-mono text-foreground">
                            {siteHost}/{usernamePreview}
                        </span>
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-7">
                        <div className="space-y-2">
                            <SimpleLabel htmlFor="username" label="Username" />
                            <Input
                                id="username"
                                name="username"
                                autoComplete="username"
                                value={form.username}
                                onChange={onUsernameChange}
                                placeholder="your-name"
                                maxLength={32}
                                aria-invalid={usernameState.status === "unavailable"}
                                className={inputClassName}
                                required
                            />
                            <p
                                className={cn(
                                    "text-[0.95rem]",
                                    usernameState.status === "available" && "text-primary",
                                    usernameState.status === "checking" && "text-muted-foreground",
                                    usernameState.status === "unavailable" && "text-destructive",
                                )}
                            >
                                {usernameHelper}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <SimpleLabel htmlFor="firstName" label="First Name" />
                                <Input
                                    id="firstName"
                                    value={form.firstName}
                                    onChange={onFieldChange("firstName")}
                                    autoComplete="given-name"
                                    placeholder="Alex"
                                    className={inputClassName}
                                />
                            </div>
                            <div className="space-y-2">
                                <SimpleLabel htmlFor="lastName" label="Last Name" />
                                <Input
                                    id="lastName"
                                    value={form.lastName}
                                    onChange={onFieldChange("lastName")}
                                    autoComplete="family-name"
                                    placeholder="Johnson"
                                    className={inputClassName}
                                />
                            </div>
                            <div className="space-y-2">
                                <FieldLabel htmlFor="location" label="Location" icon={MapPin} />
                                <Input
                                    id="location"
                                    value={form.location}
                                    onChange={onFieldChange("location")}
                                    placeholder="San Francisco, CA"
                                    className={inputClassName}
                                />
                            </div>
                            <div className="space-y-2">
                                <FieldLabel htmlFor="school" label="School" icon={GraduationCap} />
                                <Input
                                    id="school"
                                    value={form.school}
                                    onChange={onFieldChange("school")}
                                    placeholder="University name"
                                    className={inputClassName}
                                />
                            </div>
                            <div className="space-y-2">
                                <FieldLabel htmlFor="degree" label="Degree" icon={BookOpen} />
                                <Input
                                    id="degree"
                                    value={form.degree}
                                    onChange={onFieldChange("degree")}
                                    placeholder="B.S. Computer Science"
                                    className={inputClassName}
                                />
                            </div>
                            <div className="space-y-2">
                                <FieldLabel htmlFor="jobTitle" label="Job Title" icon={Building2} />
                                <Input
                                    id="jobTitle"
                                    value={form.jobTitle}
                                    onChange={onFieldChange("jobTitle")}
                                    placeholder="Frontend Engineer"
                                    className={inputClassName}
                                />
                            </div>
                            <div className="space-y-2">
                                <FieldLabel htmlFor="company" label="Company" icon={BriefcaseBusiness} />
                                <Input
                                    id="company"
                                    value={form.company}
                                    onChange={onFieldChange("company")}
                                    placeholder="Company name"
                                    className={inputClassName}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            <div className="space-y-2">
                                <FieldLabel htmlFor="websiteUrl" label="Website URL" icon={Globe} />
                                <Input
                                    id="websiteUrl"
                                    type="url"
                                    value={form.websiteUrl}
                                    onChange={onFieldChange("websiteUrl")}
                                    placeholder="https://your-site.com"
                                    className={inputClassName}
                                />
                            </div>
                            <div className="space-y-2">
                                <FieldLabel htmlFor="linkedinUrl" label="LinkedIn URL" icon={Linkedin} />
                                <Input
                                    id="linkedinUrl"
                                    type="url"
                                    value={form.linkedinUrl}
                                    onChange={onFieldChange("linkedinUrl")}
                                    placeholder="https://linkedin.com/in/you"
                                    className={inputClassName}
                                />
                            </div>
                            <div className="space-y-2">
                                <FieldLabel htmlFor="githubUrl" label="GitHub URL" icon={Github} />
                                <Input
                                    id="githubUrl"
                                    type="url"
                                    value={form.githubUrl}
                                    onChange={onFieldChange("githubUrl")}
                                    placeholder="https://github.com/you"
                                    className={inputClassName}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <FieldLabel htmlFor="bio" label="Bio" icon={AlignLeft} />
                                <span
                                    className={cn(
                                        "text-[0.85rem] text-muted-foreground",
                                        bioLength > BIO_MAX_LENGTH && "text-destructive",
                                    )}
                                >
                                    {bioLength}/{BIO_MAX_LENGTH}
                                </span>
                            </div>
                            <Textarea
                                id="bio"
                                value={form.bio}
                                onChange={onFieldChange("bio")}
                                placeholder="A short introduction to your work and interests."
                                maxLength={BIO_MAX_LENGTH}
                                className="min-h-32 text-base"
                            />
                        </div>

                        <div className="space-y-3">
                            {submitError && (
                                <p className="text-[0.95rem] text-destructive">{submitError}</p>
                            )}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-[0.95rem] text-muted-foreground">
                                    You can edit all of this later.
                                </p>
                                <Button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="h-12 text-base sm:min-w-44"
                                >
                                    {isSubmitting ? (
                                        <span className="inline-flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </span>
                                    ) : (
                                        "Continue"
                                    )}
                                </Button>
                            </div>
                        </div>

                        <p aria-live="polite" className="sr-only">
                            {usernameHelper}
                        </p>
                        <p aria-live="polite" className="sr-only">
                            {submitError ?? (isSubmitting ? "Saving profile changes..." : "")}
                        </p>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    </OnboardingShell>
);

export default OnboardingFormCard;
