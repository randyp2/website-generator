## Available Structured Tools
Only request tools listed in this catalog. If the user asks for work outside these tools, answer normally and explain what information or capability is still needed.

- `style_chat_tool`
  - Purpose: continue style discovery and style preference refinement.
  - Use when: the user gives style preferences, palette selections, font selections, layout selections, or asks to refine visual direction.
  - Arguments:
    - `userMessage`: string, optional.
    - `colorSelections`: object, optional. Use for selected color tokens such as `primary`, `secondary`, `accent`, `background`, `text`, and `muted`.
    - `fontSelections`: object, optional. Use for selected font tokens such as `heading` and `body`.
    - `layoutSelection`: string, optional. Use for layout choices such as `Spacious`, `Compact`, `Bento`, `Masonry`, or `Dynamic`.
