"use client";

import { Toggle, ToggleGroup, ToggleIcon } from "@ui-sdk/react/toggle";
import { Toolbar } from "@ui-sdk/react/toolbar";
import { EraserIcon, PencilIcon } from "lucide-react";

import { useDrawing } from "@/components/storyboard/drawing";
import type { DrawTool } from "@/lib/storyboard/strokes";

const tools = [
  { value: "pencil", label: "Pencil", icon: PencilIcon },
  { value: "eraser", label: "Eraser", icon: EraserIcon },
] as const;

const isDrawTool = (value: string): value is DrawTool =>
  value === "pencil" || value === "eraser";

const DrawTools = () => {
  const {
    actions: { setTool },
    state: { tool },
  } = useDrawing();

  return (
    <Toolbar aria-label="Drawing" className="ml-auto flex gap-1">
      <ToggleGroup
        aria-label="Drawing tool"
        className="flex gap-1"
        deselectable={false}
        onValueChange={(value) => {
          const [next] = value;
          if (next && isDrawTool(next)) {
            setTool(next);
          }
        }}
        value={[tool]}
      >
        {tools.map((item) => (
          <Toggle
            aria-label={item.label}
            className="text-muted-foreground aria-pressed:bg-foreground aria-pressed:text-primary-foreground focus-visible:outline-ring flex size-8 items-center justify-center focus-visible:outline-2"
            key={item.value}
            value={item.value}
          >
            <ToggleIcon>
              <item.icon aria-hidden="true" className="size-4" />
            </ToggleIcon>
          </Toggle>
        ))}
      </ToggleGroup>
    </Toolbar>
  );
};

export { DrawTools };
