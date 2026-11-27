"use client";

import { createContext, use, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { ProjectFile } from "@/lib/storyboard/project";
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
  onProjectChange,
  project,
  shotId,
}: {
  children: ReactNode;
  onProjectChange: (project: ProjectFile) => void;
  project: ProjectFile;
  shotId: string;
}) => {
  const [tool, setTool] = useState<DrawTool>("pencil");
  const strokes = useMemo(
    () => project.shots.find((shot) => shot.id === shotId)?.strokes ?? [],
    [project, shotId]
  );

  const addStroke = useCallback(
    (stroke: Stroke) => {
      onProjectChange({
        ...project,
        shots: project.shots.map((shot) =>
          shot.id === shotId
            ? { ...shot, strokes: [...shot.strokes, stroke] }
            : shot
        ),
      });
    },
    [onProjectChange, project, shotId]
  );

  const value = useMemo<DrawingContextValue>(
    () => ({
      state: { tool, strokes },
      actions: { addStroke, setTool },
      meta: {},
    }),
    [addStroke, strokes, tool]
  );

  return <DrawingContext value={value}>{children}</DrawingContext>;
};

export { DrawingProvider, useDrawing };
