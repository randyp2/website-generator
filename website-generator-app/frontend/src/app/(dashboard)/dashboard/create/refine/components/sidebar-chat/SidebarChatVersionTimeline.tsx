"use client";

import { AnimatePresence } from "framer-motion";
import type { Version } from "@/types/version";
import { VersionTimelineDrawer, VersionTimelineTrigger } from "../version-timeline";

interface SidebarChatVersionTimelineProps {
    isOpen: boolean;
    showTrigger: boolean;
    versions: Version[];
    isLoading: boolean;
    isActivating: boolean;
    onOpen: () => void;
    onClose: () => void;
    onExitComplete: () => void;
    onActivate: (versionId: string) => void;
}

export const SidebarChatVersionTimeline: React.FC<
    SidebarChatVersionTimelineProps
> = ({
    isOpen,
    showTrigger,
    versions,
    isLoading,
    isActivating,
    onOpen,
    onClose,
    onExitComplete,
    onActivate,
}) => (
    <div className="flex flex-col items-center">
        {showTrigger && (
            <div data-version-trigger>
                <VersionTimelineTrigger isOpen={isOpen} onClick={onOpen} />
            </div>
        )}

        <AnimatePresence onExitComplete={onExitComplete}>
            {isOpen && (
                <VersionTimelineDrawer
                    versions={versions}
                    isLoading={isLoading}
                    onClose={onClose}
                    onActivate={onActivate}
                    isActivating={isActivating}
                />
            )}
        </AnimatePresence>
    </div>
);
