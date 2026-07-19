"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { type StepBasicsProps } from "../../types";
import { ONBOARDING_INPUT_CLASS, SimpleLabel } from "./FieldLabel";

export const StepBasics = ({
    form,
    usernameState,
    usernameHelper,
    usernamePreview,
    siteHost,
    onFieldChange,
    onUsernameChange,
}: StepBasicsProps) => (
    <div className="space-y-5">
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
                className={ONBOARDING_INPUT_CLASS}
                required
            />
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <p
                    className={cn(
                        "text-sm",
                        usernameState.status === "available" && "text-primary",
                        usernameState.status === "checking" &&
                            "text-muted-foreground",
                        usernameState.status === "unavailable" &&
                            "text-destructive",
                    )}
                >
                    {usernameHelper}
                </p>
                <span className="font-mono text-xs text-muted-foreground">
                    {siteHost}/{usernamePreview}
                </span>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
                <SimpleLabel htmlFor="firstName" label="First Name" />
                <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={onFieldChange("firstName")}
                    autoComplete="given-name"
                    placeholder="Alex"
                    className={ONBOARDING_INPUT_CLASS}
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
                    className={ONBOARDING_INPUT_CLASS}
                />
            </div>
        </div>
    </div>
);
