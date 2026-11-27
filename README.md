# Storyboard

Next.js monorepo for a storyboard editor. Domain UI is rebuilt under `apps/web/components/storyboard/` (see [AGENTS.md](AGENTS.md)).

## App routes

- `/` — project hub

Run `bun run dev` from the repo root.

## shadcn/ui monorepo

This app uses the shadcn/ui workspace layout.

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button";
```
