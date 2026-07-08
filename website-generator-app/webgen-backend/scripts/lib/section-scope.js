'use strict';

/**
 * Canonical runtime scope for AI-generated portfolio sections.
 *
 * This module is the validator-side definition of the dependency contract:
 * every identifier listed here is injected into generated sections at render
 * time, using the REAL npm packages (react, lucide-react, framer-motion) so
 * that validation semantics match production exactly. A stubbed scope must
 * never be reintroduced here; permissive stubs let code pass validation that
 * later crashes against the real libraries (e.g. calling a forwardRef icon
 * as a plain function).
 *
 * Keep in sync with frontend/src/utils/sectionRuntimeScope.ts, which defines
 * the same contract for the Sandpack preview and the client-side transpiler.
 */

const React = require('react');
const lucide = require('lucide-react');
const framerMotion = require('framer-motion');

/** Lucide icon identifiers available to generated sections. */
const LUCIDE_ICON_NAMES = [
    'Mail',
    'Phone',
    'MapPin',
    'Globe',
    'Github',
    'Linkedin',
    'ArrowUpRight',
    'Twitter',
    'Instagram',
    'Youtube',
    'ExternalLink',
    'ChevronDown',
    'ChevronUp',
    'ChevronLeft',
    'ChevronRight',
    'Menu',
    'X',
    'Star',
    'Calendar',
    'Clock',
    'Check',
    'Award',
    'Briefcase',
    'GraduationCap',
    'Code',
    'Zap',
    'Send',
    'User',
    'Users',
    'Heart',
    'MessageCircle',
    'Download',
    'FileText',
    'Image',
    'Play',
    'ArrowRight',
    'ArrowLeft',
    'ArrowDown',
    'Plus',
    'Minus',
    'Search',
    'Settings',
    'Sparkles',
    'Quote',
    'Target',
    'Layers',
    'Folder',
    'Link',
];

/** Framer Motion exports available to generated sections. */
const FRAMER_MOTION_EXPORT_NAMES = [
    'motion',
    'AnimatePresence',
    'useScroll',
    'useTransform',
    'useSpring',
    'useInView',
];

/** React hooks available to generated sections without an explicit import. */
const REACT_HOOK_NAMES = [
    'useState',
    'useEffect',
    'useMemo',
    'useRef',
    'useCallback',
];

/** Bare animation constants mirrored from the frontend section scope. */
const ANIMATION_CONSTANTS = {
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

const pickExports = (moduleExports, names) => {
    const picked = {};
    for (const name of names) {
        if (moduleExports[name] === undefined) {
            throw new Error(`Section scope misconfigured: '${name}' is not exported by its module`);
        }
        picked[name] = moduleExports[name];
    }
    return picked;
};

/**
 * Builds a fresh VM sandbox exposing the full section runtime scope backed by
 * the real libraries. Returns a new object per call so module.exports state
 * never leaks between validations.
 *
 * @returns {object} sandbox globals for vm.createContext
 */
function buildSectionSandbox() {
    const moduleExports = {};

    return {
        module: { exports: moduleExports },
        exports: moduleExports,
        React,
        ...pickExports(React, REACT_HOOK_NAMES),
        ...pickExports(framerMotion, FRAMER_MOTION_EXPORT_NAMES),
        ...pickExports(lucide, LUCIDE_ICON_NAMES),
        ...ANIMATION_CONSTANTS,
        console: { log: () => {}, warn: () => {}, error: () => {} },
    };
}

module.exports = {
    LUCIDE_ICON_NAMES,
    FRAMER_MOTION_EXPORT_NAMES,
    REACT_HOOK_NAMES,
    ANIMATION_CONSTANTS,
    buildSectionSandbox,
};
