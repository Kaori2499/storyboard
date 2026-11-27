"use client";

import { createContext, use, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { DrawTool, Stroke } from "@/lib/storyboard/strokes";

interface DrawingState {
  tool: DrawTool;
  strokes: Stroke[];
}

interface DrawingActions {
  setTool: (tool: DrawTool) => void;
  addStroke: (stroke: Stroke) => void;
}

interface DrawingContextValue {
  state: DrawingState;
  actions: DrawingActions;
  meta: Record<string, never>;
}

const DrawingContext = createContext<DrawingContextValue | null>(null);

const useDrawing = () => {
  const drawing = use(DrawingContext);
  if (!drawing) {
    throw new Error("DrawingProvider is missing");
  }
  return drawing;
};

const DrawingProvider = ({
  children,
  shotId,
}: {
  children: ReactNode;
  shotId: string;
}) => {
  const [tool, setTool] = useState<DrawTool>("pencil");
  const [drawings, setDrawings] = useState<Record<string, Stroke[]>>({});

  const addStroke = useCallback(
    (stroke: Stroke) => {
      setDrawings((current) => ({
        ...current,
        [shotId]: [...(current[shotId] ?? []), stroke],
      }));
    },
    [shotId]
  );

  const value = useMemo<DrawingContextValue>(
    () => ({
      state: {
        tool,
        strokes: drawings[shotId] ?? [],
      },
      actions: { addStroke, setTool },
      meta: {},
    }),
    [addStroke, drawings, shotId, tool]
  );

  return <DrawingContext value={value}>{children}</DrawingContext>;
};

export { DrawingProvider, useDrawing };
