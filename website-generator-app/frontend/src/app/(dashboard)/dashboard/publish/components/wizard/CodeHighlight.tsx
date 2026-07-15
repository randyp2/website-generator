import { Fragment } from "react";

import { SITE_VERIFICATION_META_NAME } from "../../lib/siteVerificationFrameworks";

/**
 * Theme-aware token classes: Tokyo Night hues in dark mode, readable analogues
 * on the light (muted) surface. Keeps the code block legible in both themes.
 */
const COLORS = {
    keyword: "text-purple-600 dark:text-[#bb9af7]",
    tag: "text-rose-600 dark:text-[#f7768e]",
    attr: "text-blue-600 dark:text-[#7aa2f7]",
    string: "text-emerald-700 dark:text-[#9ece6a]",
    metaString: "font-semibold text-amber-600 dark:text-[#e0af68]",
    number: "text-orange-600 dark:text-[#ff9e64]",
    type: "text-cyan-700 dark:text-[#2ac3de]",
    punct: "text-sky-600 dark:text-[#89ddff]",
    text: "text-foreground/80",
} as const;

const KEYWORDS = new Set([
    "import",
    "export",
    "default",
    "function",
    "return",
    "const",
    "from",
    "type",
    "new",
]);

interface Token {
    text: string;
    className: string;
}

/**
 * Minimal single-line tokenizer for the HTML/JSX snippets we generate. It is
 * not a general parser: it recognizes just enough (tags, attributes, strings,
 * keywords, numbers) to render natural-looking syntax colors.
 */
const tokenizeLine = (line: string): Token[] => {
    const tokens: Token[] = [];
    const push = (text: string, className: string) =>
        tokens.push({ text, className });

    const n = line.length;
    let i = 0;
    let afterAngle = false; // previous punctuation opened a tag (< or </)

    while (i < n) {
        const ch = line[i];

        if (/\s/.test(ch)) {
            let j = i + 1;
            while (j < n && /\s/.test(line[j])) j++;
            push(line.slice(i, j), COLORS.text);
            i = j;
            continue;
        }

        if (ch === '"' || ch === "'") {
            let j = i + 1;
            while (j < n && line[j] !== ch) {
                if (line[j] === "\\") j++;
                j++;
            }
            j = Math.min(j + 1, n);
            const str = line.slice(i, j);
            const isMeta = str.includes(SITE_VERIFICATION_META_NAME);
            push(str, isMeta ? COLORS.metaString : COLORS.string);
            afterAngle = false;
            i = j;
            continue;
        }

        if (ch === "<") {
            if (line[i + 1] === "/") {
                push("</", COLORS.punct);
                i += 2;
            } else {
                push("<", COLORS.punct);
                i += 1;
            }
            afterAngle = true;
            continue;
        }
        if (ch === "/" && line[i + 1] === ">") {
            push("/>", COLORS.punct);
            i += 2;
            afterAngle = false;
            continue;
        }
        if (ch === ">") {
            push(">", COLORS.punct);
            i += 1;
            afterAngle = false;
            continue;
        }

        if (/[A-Za-z_]/.test(ch)) {
            let j = i + 1;
            while (j < n && /[\w-]/.test(line[j])) j++;
            const word = line.slice(i, j);
            let k = j;
            while (k < n && line[k] === " ") k++;
            const nextIsEquals = line[k] === "=";

            let className: string = COLORS.text;
            if (afterAngle) className = COLORS.tag;
            else if (KEYWORDS.has(word)) className = COLORS.keyword;
            else if (nextIsEquals) className = COLORS.attr;
            else if (/^[A-Z]/.test(word)) className = COLORS.type;

            push(word, className);
            afterAngle = false;
            i = j;
            continue;
        }

        if (/[0-9]/.test(ch)) {
            let j = i + 1;
            while (j < n && /[\w.]/.test(line[j])) j++;
            push(line.slice(i, j), COLORS.number);
            afterAngle = false;
            i = j;
            continue;
        }

        push(ch, ch === "=" ? COLORS.punct : COLORS.text);
        afterAngle = false;
        i += 1;
    }

    return tokens;
};

/** Renders a single code line with theme-aware token colors. */
export const HighlightedCode = ({ line }: { line: string }) => (
    <>
        {tokenizeLine(line).map((token, index) => (
            <Fragment key={index}>
                <span className={token.className}>{token.text}</span>
            </Fragment>
        ))}
    </>
);
