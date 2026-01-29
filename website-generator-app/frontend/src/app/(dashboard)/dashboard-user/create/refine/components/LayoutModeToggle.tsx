"use client";

import React from "react";
import { PanelLeft, MessageSquare, Monitor } from "lucide-react";

export type ChatLayoutMode = 'sidebar' | 'floating' | 'preview';

interface LayoutModeToggleProps {
    mode: ChatLayoutMode;
    onChange: (mode: ChatLayoutMode) => void;
}

const modes: { value: ChatLayoutMode; icon: React.ElementType; tooltip: string }[] = [
    { value: 'sidebar', icon: PanelLeft, tooltip: 'Chat docked to left' },
    { value: 'floating', icon: MessageSquare, tooltip: 'Floating chat overlay' },
    { value: 'preview', icon: Monitor, tooltip: 'Full preview, no chat' },
];

export const LayoutModeToggle: React.FC<LayoutModeToggleProps> = ({
    mode,
    onChange,
}) => {
    return (
        <div className="flex items-center bg-slate-800/80 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            {modes.map(({ value, icon: Icon, tooltip }) => (
                <button
                    key={value}
                    onClick={() => onChange(value)}
                    className={`
                        relative group p-2 rounded-md transition-all duration-200
                        ${mode === value
                            ? 'bg-purple-600/90 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }
                    `}
                    aria-label={tooltip}
                >
                    <Icon className="w-4 h-4" />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none border border-white/10">
                        {tooltip}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                    </div>
                </button>
            ))}
        </div>
    );
};
