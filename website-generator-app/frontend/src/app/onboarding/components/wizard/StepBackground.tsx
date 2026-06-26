"use client";

import {
    BookOpen,
    BriefcaseBusiness,
    Building2,
    GraduationCap,
    MapPin,
} from "lucide-react";

import { Input } from "@/components/ui/input";

import { type StepBackgroundProps } from "../../types";
import { FieldLabel, ONBOARDING_INPUT_CLASS } from "./FieldLabel";

export const StepBackground = ({
    form,
    onFieldChange,
}: StepBackgroundProps) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
            <FieldLabel htmlFor="location" label="Location" icon={MapPin} />
            <Input
                id="location"
                value={form.location}
                onChange={onFieldChange("location")}
                placeholder="San Francisco, CA"
                className={ONBOARDING_INPUT_CLASS}
            />
        </div>
        <div className="space-y-2">
            <FieldLabel htmlFor="school" label="School" icon={GraduationCap} />
            <Input
                id="school"
                value={form.school}
                onChange={onFieldChange("school")}
                placeholder="University name"
                className={ONBOARDING_INPUT_CLASS}
            />
        </div>
        <div className="space-y-2">
            <FieldLabel htmlFor="degree" label="Degree" icon={BookOpen} />
            <Input
                id="degree"
                value={form.degree}
                onChange={onFieldChange("degree")}
                placeholder="B.S. Computer Science"
                className={ONBOARDING_INPUT_CLASS}
            />
        </div>
        <div className="space-y-2">
            <FieldLabel htmlFor="jobTitle" label="Job Title" icon={Building2} />
            <Input
                id="jobTitle"
                value={form.jobTitle}
                onChange={onFieldChange("jobTitle")}
                placeholder="Frontend Engineer"
                className={ONBOARDING_INPUT_CLASS}
            />
        </div>
        <div className="space-y-2">
            <FieldLabel
                htmlFor="company"
                label="Company"
                icon={BriefcaseBusiness}
            />
            <Input
                id="company"
                value={form.company}
                onChange={onFieldChange("company")}
                placeholder="Company name"
                className={ONBOARDING_INPUT_CLASS}
            />
        </div>
    </div>
);
