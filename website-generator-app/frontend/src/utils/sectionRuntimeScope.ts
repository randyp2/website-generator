import React, {
    useState,
    useEffect,
    useMemo,
    useRef,
    useCallback,
} from "react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useTransform,
    useSpring,
    useInView,
} from "framer-motion";
import {
    Mail,
    Phone,
    MapPin,
    Globe,
    Github,
    Linkedin,
    ArrowUpRight,
    Twitter,
    Instagram,
    Youtube,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Star,
    Calendar,
    Clock,
    Check,
    Award,
    Briefcase,
    GraduationCap,
    Code,
    Zap,
    Send,
    User,
    Users,
    Heart,
    MessageCircle,
    Download,
    FileText,
    Image,
    Play,
    ArrowRight,
    ArrowLeft,
    ArrowDown,
    Plus,
    Minus,
    Search,
    Settings,
    Sparkles,
    Quote,
    Target,
    Layers,
    Folder,
    Link,
} from "lucide-react";

/**
 * Canonical runtime scope for AI-generated portfolio sections.
 *
 * This module is the single frontend definition of every identifier a
 * generated section may reference: the client-side transpiler, the Sandpack
 * preview, and (by convention) the backend validator and HTML export all
 * derive their scope from these lists. Add or remove an identifier HERE, not
 * in the individual consumers.
 *
 * Keep in sync with webgen-backend/scripts/lib/section-scope.js, which
 * defines the same contract for the server-side JSX validator.
 */

/** Lucide icon components available to generated sections. */
export const LUCIDE_ICONS: Record<string, unknown> = {
    Mail,
    Phone,
    MapPin,
    Globe,
    Github,
    Linkedin,
    ArrowUpRight,
    Twitter,
    Instagram,
    Youtube,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Star,
    Calendar,
    Clock,
    Check,
    Award,
    Briefcase,
    GraduationCap,
    Code,
    Zap,
    Send,
    User,
    Users,
    Heart,
    MessageCircle,
    Download,
    FileText,
    Image,
    Play,
    ArrowRight,
    ArrowLeft,
    ArrowDown,
    Plus,
    Minus,
    Search,
    Settings,
    Sparkles,
    Quote,
    Target,
    Layers,
    Folder,
    Link,
};

/** Icon identifiers, used to generate Sandpack import statements. */
export const LUCIDE_ICON_NAMES: string[] = Object.keys(LUCIDE_ICONS);

/** Framer Motion values available to generated sections. */
export const FRAMER_MOTION_SCOPE: Record<string, unknown> = {
    motion,
    AnimatePresence,
    useScroll,
    useTransform,
    useSpring,
    useInView,
};

export const FRAMER_MOTION_EXPORT_NAMES: string[] =
    Object.keys(FRAMER_MOTION_SCOPE);

/** React hooks available to generated sections without an explicit import. */
export const REACT_HOOK_SCOPE: Record<string, unknown> = {
    useState,
    useEffect,
    useMemo,
    useRef,
    useCallback,
};

export const REACT_HOOK_NAMES: string[] = Object.keys(REACT_HOOK_SCOPE);

/**
 * Bare animation constants some generated sections reference via object
 * shorthand (e.g. viewport={{ once }}). Mirrored from the backend export.
 */
export const ANIMATION_CONSTANTS: Record<string, unknown> = {
    once: true,
    y: 0,
    x: 0,
    opacity: 1,
    scale: 1,
    rotate: 15,
    stiffness: 260,
    damping: 20,
    repeat: Infinity,
    duration: 0.5,
};

/**
 * Full dependency scope injected into every transpiled section. This is the
 * ground truth the validator must mirror: anything renderable here must also
 * validate, and anything that crashes here must fail validation.
 */
export const SECTION_SCOPE: Record<string, unknown> = {
    React,
    ...REACT_HOOK_SCOPE,
    ...FRAMER_MOTION_SCOPE,
    ...ANIMATION_CONSTANTS,
    ...LUCIDE_ICONS,
};

/**
 * npm dependency versions for the Sandpack preview. Centralized so every
 * Sandpack instance resolves the identical package versions.
 */
export const SANDPACK_RUNTIME_DEPENDENCIES: Record<string, string> = {
    "framer-motion": "^10.0.0",
    "lucide-react": "^0.294.0",
};
