## Available Structured Tools
Only request tools listed in this catalog. If the user asks for work outside these tools, answer normally and explain what information or capability is still needed.

- `record_style_preference_tool`
  - Purpose: persist known style choices into durable agent memory under `memory_json.style`.
  - Use when: the user provides any subset of design goal, selected colors, selected fonts, or selected layout.
  - Writes: merges any provided fields into `style: { designGoal, colors, fonts, layout }`.
  - Returns: `collected`, `isComplete`, and `nextPickerHint`.
  - Arguments:
    - `designGoal`: string, optional. Use when the user describes the desired visual direction, vibe, tone, or theme.
    - `colors`: object, optional. Use only when the user has selected or explicitly provided color tokens.
    - `fonts`: object, optional. Use only when the user has selected or explicitly provided font tokens such as `heading` and `body`.
    - `layout`: string, optional. Use only when the user has selected or explicitly provided a layout choice.
- `recommend_style_palette_tool`
  - Purpose: generate color preset and font recommendations for a known design goal.
  - Use when: a design goal exists and the next UX step needs palette/font recommendations.
  - Writes: nothing. This tool does not mutate memory.
  - Returns: `recommendedColorPresets`, `recommendedHeadingFont`, and `recommendedBodyFont`.
  - Arguments:
    - `designGoal`: string, optional. If omitted, the tool reads `memory_json.style.designGoal`.
- `style_chat_tool`
  - Purpose: legacy full style discovery flow backed by `memory_json.styleContext`.
  - Use when: continuing the existing legacy style-chat sequence is required.
  - Arguments:
    - `userMessage`: string, optional.
    - `colorSelections`: object, optional. Use for selected color tokens such as `primary`, `secondary`, `accent`, `background`, `text`, and `muted`.
    - `fontSelections`: object, optional. Use for selected font tokens such as `heading` and `body`.
    - `layoutSelection`: string, optional. Use for layout choices such as `Spacious`, `Compact`, `Bento`, `Masonry`, or `Dynamic`.
