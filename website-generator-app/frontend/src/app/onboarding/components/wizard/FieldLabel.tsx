import { type LucideIcon } from "lucide-react";

import { Label } from "@/components/ui/label";

const iconCircleClassName =
    "inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f59e0b]/18 text-[#f59e0b] dark:bg-[#fb923c]/20 dark:text-[#fdba74]";

type SimpleLabelProps = {
    htmlFor: string;
    label: string;
};

type FieldLabelProps = SimpleLabelProps & {
    icon: LucideIcon;
};

export const SimpleLabel = ({ htmlFor, label }: SimpleLabelProps) => (
    <Label
        htmlFor={htmlFor}
        className="inline-flex items-center text-sm font-medium text-foreground"
    >
        {label}
    </Label>
);

export const FieldLabel = ({ htmlFor, label, icon: Icon }: FieldLabelProps) => (
    <Label
        htmlFor={htmlFor}
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
    >
        <span className={iconCircleClassName}>
            <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
    </Label>
);

export const ONBOARDING_INPUT_CLASS = "h-11 text-base";
