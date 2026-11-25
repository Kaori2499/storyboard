<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## ui-sdk

Before using ui-sdk, follow the ui-sdk skill if it's installed, and read `node_modules/@ui-sdk/react/docs/llms.txt`. To build a new component, also search `node_modules/@ui-sdk/react/docs/core.md` by heading, and read `rendering.md` next to it.

## Ultracite

Before linting or formatting, or when writing or reviewing JS/TS in this repo, invoke `/ultracite` and follow the ultracite skill if it's installed. After edits, run `bun run fix` or `bun run check`.

## UI, animation, and UX (Emil Kowalski skills)

When building interfaces, adding motion, or polishing UX in this repo, use the [AI for UI skills](https://aiforui.dev/skills) via slash commands (project `.agents/skills/` or user skills). If they are missing, install with `npx skills@latest add emilkowalski/skills` and read the skill before implementing.

Default: for UI components, interaction feel, or “make this nicer,” start with `/emil-design-eng`. For new motion on a specific element, `/animate`. Unsure which skill fits, `/animation-vocabulary` (naming) or route by task below.

| Phase | When | Skills |
| --- | --- | --- |
| Before you build | Picking a UI stack, comparing options, or exploring variants | `/pick-ui-library`, `/prototyping` |
| Building | Layout, components, press states, responsive polish, sheets/drawers, drag/swipe, iOS-like motion | `/emil-design-eng`, `/animate`, `/choreograph`, `/apple-design`, `/gestures`, `/mobile-native` |
| Refining | Jank, FPS, `will-change`, strict motion review, edge-case UI stress tests | `/animation-performance`, `/review-animations`, `/break-ui` |
| Whole app | Audits, too much/too little motion, app-wide easing plans | `/find-animation-opportunities`, `/improve-animations`, `/remove-animations` |
| Tool-specific | Sonner toasts; Expo / React Native motion | `/ask-sonner`, `/animate-expo` |

After UI or animation changes, run `bun run check` (or `bun run fix`) and consider `/break-ui` on screens you touched.

## Design tokens (primitives + semantics)

Tokens live in `packages/ui/src/styles/tokens/`. A good design system keeps humans and agents from guessing colors.

**Two layers**

1. **Primitives** (`primitives.css`) — raw values without UI meaning (`--ink-1000`, `--sand-700`, `--red-500`). Do not use these in components or pages.
2. **Semantic roles** (`semantic.css`) — purpose-driven tokens (`--content-tertiary`, `--surface-canvas`, `--action-primary`). Theme switching only changes which primitive each role references in `:root` vs `.dark`, not component code.

**Rules when editing UI**

- Prefer Tailwind classes backed by semantics: `text-content-tertiary`, `bg-surface-canvas`, `text-muted-foreground` (shadcn bridge), `border-border`, `bg-primary`.
- Do not add arbitrary hex/rgb/oklch in TSX/CSS, and do not sprinkle `dark:` for colors that should be semantic — add or adjust a role in `semantic.css` instead.
- New color needs → add a **role** in `semantic.css` (light + dark mappings), expose it in `globals.css` `@theme` if needed, then use the class in UI.
- shadcn variable names (`--background`, `--primary`, …) are a **compatibility bridge** only; they alias semantic roles at the bottom of `semantic.css`.

**Examples**

- Body copy hierarchy: `text-foreground` / `text-content-secondary` / `text-content-tertiary` — never `--sand-700` or `#432154` in JSX.
- Page background: `bg-background` or `bg-surface-canvas`.
- Destructive soft button: `var(--surface-destructive-subtle)` pattern in components (see `button.tsx` destructive variant).
