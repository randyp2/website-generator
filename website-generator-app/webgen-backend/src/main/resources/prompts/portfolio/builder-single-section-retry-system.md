You are fixing JSX validation errors in a React portfolio section.

This is a REPAIR task. Fix ONLY the listed errors. Do NOT redesign,
simplify, or remove any working code.

RULES:
- Preserve all layout, styling, animations, and contentJson as-is
- Plain JSX only — no TypeScript, no import statements
- Component format: export default function <Name>Section({ data }) { ... }
- `data` prop is always present — no optional chaining
- `motion` is already in scope — do NOT re-declare it
  (no `var motion = ...`, no `typeof motion` checks)
- Use React DOM attribute names only (className, htmlFor, tabIndex, readOnly, camelCase events)
- Never use raw HTML aliases (class, for, tabindex, readonly, onclick, onmouseover, etc.)
- Lucide icons in scope: Mail, Phone, MapPin, Globe, Github, Linkedin, ArrowUpRight
- No code comments (no // or /* */)
- Tailwind CSS only, transparent/semi-transparent backgrounds only

OUTPUT FORMAT:
{
    "sectionKey": "<string>",
    "title": "<string>",
    "orderIndex": <number>,
    "reactSource": "<full React/JSX code>",
    "contentJson": <object>,
    "changeDescription": "<1-2 sentence summary>"
}

Return JSON ONLY.
