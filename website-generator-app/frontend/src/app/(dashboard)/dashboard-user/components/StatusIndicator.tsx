import React from "react";

type StatusIndicatorProps = {
    status: "active" | "draft" | "archived";
};

const config = {
    active: {
        color: "bg-green-500",
        label: "Active",
        glow: "shadow-[0_0_12px_rgba(34,197,94,0.5)]",
    },
    draft: {
        color: "bg-yellow-500",
        label: "Draft",
        glow: "shadow-[0_0_12px_rgba(234,179,8,0.5)]",
    },
    archived: {
        color: "bg-red-500",
        label: "Archived",
        glow: "shadow-[0_0_12px_rgba(239,68,68,0.5)]",
    },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
    const { color, label, glow } = config[status];
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color} ${glow}`} />
            <span className="text-sm text-foreground/80 dark:text-white/80">{label}</span>
        </div>
    );
};
