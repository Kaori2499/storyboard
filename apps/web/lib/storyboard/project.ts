import { err, ok } from "neverthrow";
import type { Result } from "neverthrow";

import type { Stroke } from "@/lib/storyboard/strokes";

interface ProjectShot {
  id: string;
  label: string;
  strokes: Stroke[];
}

interface ProjectFile {
  version: 1;
  id: string;
  title: string;
  shots: ProjectShot[];
}

type ProjectError =
  | { kind: "invalid" }
  | { kind: "not_found"; id: string }
  | { kind: "io" };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStroke = (value: unknown): value is Stroke => {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.id !== "string") {
    return false;
  }
  if (value.tool !== "pencil" && value.tool !== "eraser") {
    return false;
  }
  if (!Array.isArray(value.points)) {
    return false;
  }
  return value.points.every(
    (point) =>
      isRecord(point) &&
      typeof point.x === "number" &&
      typeof point.y === "number" &&
      typeof point.pressure === "number"
  );
};

const isShot = (value: unknown): value is ProjectShot => {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.id !== "string" || typeof value.label !== "string") {
    return false;
  }
  return Array.isArray(value.strokes) && value.strokes.every(isStroke);
};

const parseProject = (value: unknown): Result<ProjectFile, ProjectError> => {
  if (
    !(
      isRecord(value) &&
      value.version === 1 &&
      typeof value.id === "string" &&
      value.id.length > 0 &&
      typeof value.title === "string" &&
      Array.isArray(value.shots) &&
      value.shots.every(isShot)
    )
  ) {
    return err({ kind: "invalid" });
  }

  return ok({
    version: 1,
    id: value.id,
    title: value.title,
    shots: value.shots,
  });
};

export { parseProject };
export type { ProjectError, ProjectFile, ProjectShot };
