import React from "react";
import { SECTION_SCOPE } from "@/utils/sectionRuntimeScope";

// ---------------------------------------------------------------------------
// Source transforms — mirrors the backend's transformSectionSource logic
// ---------------------------------------------------------------------------

/** Remove all import statements (deps are provided via scope). */
const stripImports = (source: string): string =>
    source
        .replace(/^import\s+.*?;\s*$/gm, "")
        .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, "");

/** Remove "use client" directives. */
const stripUseClient = (source: string): string =>
    source.replace(/^['"]use client['"];?\s*$/gm, "");

/**
 * Ensure the source has a default export and normalise it to a
 * variable assignment (`const __Component = ...`) so the eval wrapper
 * can pick it up.
 */
const normalizeExport = (source: string, index: number): string => {
    const name = `__Section${index}`;

    // export default function Name(
    const withNamed = source.replace(
        /export\s+default\s+function\s+\w+\s*\(/,
        `const ${name} = function(`,
    );
    if (withNamed !== source) return withNamed;

    // export default function(  (anonymous)
    const withAnon = source.replace(
        /export\s+default\s+function\s*\(/,
        `const ${name} = function(`,
    );
    if (withAnon !== source) return withAnon;

    // export default arrow: export default ({ ... }) =>
    const withArrow = source.replace(
        /export\s+default\s+/,
        `const ${name} = `,
    );
    if (withArrow !== source) return withArrow;

    // No export found — look for a top-level named function component
    const fnMatch = source.match(/function\s+([A-Z]\w*)\s*\(/);
    const constMatch = source.match(
        /const\s+([A-Z]\w*)\s*=\s*(\(|function|\(.*\)\s*=>)/,
    );
    const componentName = fnMatch?.[1] ?? constMatch?.[1];

    if (componentName) {
        return `${source}\nconst ${name} = ${componentName};`;
    }

    // Fallback — return a placeholder component
    return `const ${name} = () => React.createElement("div", { style: { padding: "2rem", opacity: 0.5 } }, "Section could not be resolved.");`;
};

// ---------------------------------------------------------------------------
// Transpilation cache — avoids re-compiling identical source strings
// ---------------------------------------------------------------------------
const cache = new Map<string, React.ComponentType<{ content: unknown; data: unknown }>>();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Transpiles a raw `reactSource` string into a callable React component.
 *
 * 1. Strips imports, directives, and TypeScript syntax
 * 2. Normalises the default export to a known variable name
 * 3. Transpiles JSX → JS via Babel standalone
 * 4. Evaluates the result with the shared dependency scope
 * 5. Returns a React component (or a fallback on error)
 *
 * Results are cached by source string so repeat renders are free.
 */
export const transpileSection = (
    reactSource: string,
    index: number,
    extraScope?: Record<string, unknown>,
): React.ComponentType<{ content: unknown; data: unknown }> => {
    // Build a cache key from serialisable extra-scope values only (skip DOM nodes).
    const extraKey = extraScope
        ? Object.entries(extraScope)
              .filter(([, v]) => typeof v !== "object" || v === null)
              .map(([k, v]) => `${k}=${v}`)
              .join("&")
        : "";
    const cacheKey = `${index}::${reactSource}::${extraKey}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
        // 1. Transform the source
        let code = reactSource;
        code = stripImports(code);
        code = stripUseClient(code);
        code = normalizeExport(code, index);

        // Clean up excessive blank lines
        code = code.replace(/\n{3,}/g, "\n\n").trim();

        // 2. Transpile JSX + TypeScript → JS via Babel.
        //    The "typescript" preset handles TS annotations natively,
        //    avoiding the fragile regex stripping that broke ternaries.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Babel = require("@babel/standalone");
        const transpiled: string = Babel.transform(code, {
            presets: ["react", "typescript"],
            filename: `Section${index}.tsx`,
        }).code;

        // 3. Build a function that receives the scope as arguments and returns the component
        const varName = `__Section${index}`;
        const mergedScope = extraScope
            ? { ...SECTION_SCOPE, ...extraScope }
            : SECTION_SCOPE;
        const scopeKeys = Object.keys(mergedScope);
        const scopeValues = scopeKeys.map((k) => mergedScope[k]);

        // The transpiled code assigns the component to `varName`.
        // We append a return statement so the wrapper function hands it back.
        const wrapped = `${transpiled}\nreturn ${varName};`;

        const factory = new Function(...scopeKeys, wrapped);
        const Component = factory(...scopeValues);

        if (typeof Component !== "function") {
            throw new Error("Transpiled source did not produce a component");
        }

        cache.set(cacheKey, Component);
        return Component;
    } catch (err) {
        console.error(`[transpileSection] Section ${index} failed:`, err);

        // Return a fallback component that surfaces the error in dev
        const Fallback: React.FC = () =>
            React.createElement(
                "div",
                {
                    style: {
                        padding: "2rem",
                        textAlign: "center",
                        opacity: 0.5,
                    },
                },
                React.createElement(
                    "p",
                    { style: { fontSize: "0.875rem" } },
                    "This section could not be rendered.",
                ),
            );
        Fallback.displayName = `SectionFallback${index}`;
        return Fallback as React.ComponentType<{ content: unknown; data: unknown }>;
    }
};

/** Clear the transpilation cache (useful for hot-reload scenarios). */
export const clearTranspileCache = (): void => {
    cache.clear();
};
