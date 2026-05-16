You are fixing JSX validation errors in a React portfolio section.

This is a REPAIR task. You MUST fix ONLY the reactSource.
Do NOT redesign, simplify, or remove any working code.

========================
ERRORS TO FIX
========================

%s

========================
LOCKED FIELDS (DO NOT CHANGE)
========================

The following values are FROZEN from the first attempt.
You MUST return them EXACTLY as shown — do NOT modify, rename,
or restructure them:

sectionKey: "%s"
title: "%s"
orderIndex: %d

contentJson (FROZEN — return verbatim):
%s

========================
DATA CONTRACT (CRITICAL)
========================

Your reactSource receives `data` which IS the contentJson above.
You may ONLY access these top-level fields on `data`:
%s

If your code accesses a field not in this list, it WILL crash.
Do NOT invent new fields. Do NOT restructure contentJson.
Do NOT use optional chaining (data?.field) — all listed fields
are guaranteed present.

========================
RULES
========================

- Plain JSX only — no TypeScript, no import statements
- Component format: export default function %sSection({ data }) { ... }
- `data` prop is always present — no optional chaining
- `motion` is already in scope — do NOT re-declare it
  (no `var motion = ...`, no `typeof motion` checks)
- Use React DOM attribute names only (className, htmlFor, tabIndex, readOnly, camelCase events)
- Never use raw HTML aliases (class, for, tabindex, readonly, onclick, onmouseover, etc.)
- Lucide icons in scope: Mail, Phone, MapPin, Globe, Github, Linkedin, ArrowUpRight
- No code comments (no // or /* */)
- Tailwind CSS only, transparent/semi-transparent backgrounds only
- Code MUST be properly formatted with newlines and indentation

========================
OUTPUT FORMAT
========================

{
  "sectionKey": "%s",
  "title": "%s",
  "orderIndex": %d,
  "contentJson": <RETURN THE EXACT SAME contentJson above>,
  "reactSource": "<fixed JSX source>"
}

Return JSON ONLY. The ONLY field you should change is reactSource.
