<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## AGENTS.md first

Agents and humans: **open this file before building the app.** Project rules in `.cursor/rules/` point here. Sections below cover Next.js, ui-sdk, tokens, the storyboard editor, errors, lint, and UX skills.

## ui-sdk (preferred for app UI)

Use the **ui-sdk pattern** for interactive UI in `apps/web`: import from package entries (e.g. `@ui-sdk/react/button`, `@ui-sdk/react/field`), compose documented parts (Composition in each `docs/components/<name>.md`), wire state with `value` / `defaultValue` and `onValueChange`, and style with Tailwind on `data-slot` and state attributes — not raw `<button>`, bare `<input>`, or hand-rolled ARIA roles when ui-sdk ships the behavior.

This is **not** the shadcn/Base UI kit in `packages/ui` (variants in the package, `onChange`, manual `Label` + `id`). Storyboard screens consume ui-sdk behaviors instead.

Before using ui-sdk, follow the ui-sdk skill if it's installed, and read `node_modules/@ui-sdk/react/docs/llms.txt`.

### Two paths (both are ui-sdk)

ui-sdk docs teach the **kernel** (“Build a Component”: `definePrimitive` → `createParts` → style `data-slot`) and **shipped components** (import `@ui-sdk/react/toggle`, compose parts, style state attrs). This repo uses path 1 by default; use path 2 only when ui-sdk has no entry for the interaction.

| Path | When | What you write | Docs / skill |
| --- | --- | --- | --- |
| **1 — Interface** | Toolbar, fields, listbox, dialogs, anything in the [build-interface table](.agents/skills/ui-sdk/references/build-interface.md) | Import `@ui-sdk/react/<name>`, nest parts per `docs/components/<name>.md`, `value` / `onValueChange`, product styles in TSX or `classes.ts` | `llms.txt` + each component page; [.agents/skills/ui-sdk/references/build-interface.md](.agents/skills/ui-sdk/references/build-interface.md) |
| **2 — Custom component** | Behavior ui-sdk does not ship (custom canvas chrome, novel APG pattern) | `definePrimitive` in `apps/web/lib/...` (or similar), thin `createParts` wrapper under `apps/web/components/ui/`, optional `agent` key on the primitive | Search `node_modules/@ui-sdk/react/docs/core.md` by heading (“Build a Component”, “Compose Behaviors”), read `rendering.md`; [.agents/skills/ui-sdk/references/create-component.md](.agents/skills/ui-sdk/references/create-component.md) |

**Same rules on both paths**

- Behavior and ARIA live in the primitive layer; adapters render, they do not reinvent keyboard/focus/`aria-*`.
- Style from **`data-slot`** and **state attributes** (`aria-pressed`, `data-pressed`, `aria-selected`, `data-open`, …), not parallel React state for accessibility.
- **`render`** to swap the element (e.g. `Button` + `Link`); no `as` prop.
- Name every control (`FieldLabel`, `Field name`, `aria-label` on icon-only tools) for agents and screen readers.

**Storyboard today is path 1.** Example: pen/eraser tools are `@ui-sdk/react/toggle` + `Toolbar` (library primitives already defined inside `@ui-sdk`), styled via `classes.ts` (`data-pressed:`). You would only add path 2 for editor-specific widgets with no matching `@ui-sdk/react/*` entry.

**Not ui-sdk:** adding shadcn primitives from `packages/ui` to storyboard when a path-1 entry exists.

**Stack split**

| Layer | Use |
| --- | --- |
| `apps/web` screens & `components/storyboard/` | **@ui-sdk/react** + `@ui-sdk/core` |
| `packages/ui` | shadcn/Base UI shared kit, design tokens, global CSS (`@layer ui-sdk` in `globals.css`) |

**Defaults for this product**

- Actions → `Button` (links via `render={<Link />}`)
- Form metadata → `Field` + `FieldLabel` + `Input` / `Textarea` / `NumberInput`
- Filmstrip selection → `Listbox` + `ListboxItem` (horizontal `orientation`)
- Canvas tools → `Toolbar` + `Toggle` / `ToggleGroup` + `ToolbarButton`
- Editor split → `Resizable` + `ResizablePanel` + `ResizableHandle`
- Inspector scroll → `ScrollArea` (name regions for agents)

Keep every control named (`FieldLabel`, `aria-label` on icon-only controls). Prefer agent-ready flows in [agent-ready.md](.agents/skills/ui-sdk/references/agent-ready.md). After wiring a screen, add or extend a Vitest agent snapshot test under `apps/web/` per the ui-sdk skill.

Do **not** add new shadcn primitives to storyboard screens when an ui-sdk entry exists. shadcn adds belong in `packages/ui` only for cross-app chrome not covered above.

## Errors (neverthrow)

Expected failures are values, not throws. In `apps/web`, use [`neverthrow`](https://github.com/supermacro/neverthrow) and follow the neverthrow skill when it is installed.

| Kind | Return |
| --- | --- |
| Sync check that can fail (parse, validation) | `Result` via `ok` / `err` |
| File, HTTP, or other async failure | `ResultAsync` via `okAsync` / `errAsync` / `fromPromise` |
| A library that throws | Wrap it once with `fromThrowable` or `fromPromise`, then stay on `Result` |

- Give the error a discriminated `kind` (`invalid`, `not_found`, `io`), not a bare string.
- `map` when the next step cannot fail. `andThen` when it returns another `Result`. Do not nest `Result<Result<…>>`.
- Unwrap once at the edge with `match`. Do not ignore a `Result`. `_unsafeUnwrap` is for tests only.
- `throw` is for a programmer mistake. A bad project file, a missing id, or a failed read is an `err`.

`parseProject`, `readProject`, and `writeProject` in `apps/web/lib/storyboard/` are the reference. The web ESLint config uses a Babel parser, so `eslint-plugin-neverthrow` is not wired; still consume every `Result`.

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

## Storyboard app

Editor domain UI lives under `apps/web/components/storyboard/` (not `packages/ui`). Types and fixtures belong in `apps/web/lib/storyboard/`. **Build with ui-sdk path 1** (see above), not shadcn compound shells. Shared tokens from `@workspace/ui/globals.css`.

The previous v0 shell was removed for a clean restart. Target shape when you rebuild:

| Area | ui-sdk direction |
| --- | --- |
| Hub / chrome | `Button`, links via `render` |
| Shell layout | Compound layout (divs) + `Resizable` for canvas \| inspector |
| Filmstrip | `Listbox` (horizontal) |
| Inspector | `Field`, `Input`, `Textarea`, `NumberInput`, `ScrollArea` |
| Canvas tools | `Toolbar`, `Toggle` / `ToggleGroup` |

Add Vitest agent tests in `apps/web/components/storyboard/*.test.tsx` as screens land. Run `bun run test` in `apps/web`.
