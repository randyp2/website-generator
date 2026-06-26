"use client";

import { AlignLeft, Github, Globe, Linkedin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { BIO_MAX_LENGTH } from "../../constants";
import { type StepLinksBioProps } from "../../types";
import { FieldLabel, ONBOARDING_INPUT_CLASS } from "./FieldLabel";

export const StepLinksBio = ({
    form,
    bioLength,
    onFieldChange,
}: StepLinksBioProps) => (
    <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
                <FieldLabel htmlFor="websiteUrl" label="Website" icon={Globe} />
                <Input
                    id="websiteUrl"
                    type="url"
                    value={form.websiteUrl}
                    onChange={onFieldChange("websiteUrl")}
                    placeholder="https://your-site.com"
                    className={ONBOARDING_INPUT_CLASS}
                />
            </div>
            <div className="space-y-2">
                <FieldLabel
                    htmlFor="linkedinUrl"
                    label="LinkedIn"
                    icon={Linkedin}
                />
                <Input
                    id="linkedinUrl"
                    type="url"
                    value={form.linkedinUrl}
                    onChange={onFieldChange("linkedinUrl")}
                    placeholder="https://linkedin.com/in/you"
                    className={ONBOARDING_INPUT_CLASS}
                />
            </div>
            <div className="space-y-2">
                <FieldLabel htmlFor="githubUrl" label="GitHub" icon={Github} />
                <Input
                    id="githubUrl"
                    type="url"
                    value={form.githubUrl}
                    onChange={onFieldChange("githubUrl")}
                    placeholder="https://github.com/you"
                    className={ONBOARDING_INPUT_CLASS}
                />
            </div>
        </div>

        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <FieldLabel htmlFor="bio" label="Bio" icon={AlignLeft} />
                <span
                    className={cn(
                        "text-xs text-muted-foreground",
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
                className="min-h-24 text-base"
            />
        </div>
    </div>
);
