import { expect, test } from "vitest";

import { beginStroke, emptySession, extendStroke } from "./strokes";
import type { PointerSample } from "./strokes";

const sample = (patch: Partial<PointerSample> = {}): PointerSample => ({
  pointerId: 1,
  pointerType: "pen",
  x: 0,
  y: 0,
  pressure: 0.4,
  buttons: 1,
  ...patch,
});

test("a point keeps its pressure", () => {
  const started = beginStroke(
    emptySession(),
    sample({ pressure: 0.2 }),
    "pencil",
    "stroke-1"
  );
  const moved = extendStroke(started, [sample({ pressure: 0.8, x: 4 })]);

  expect(moved.stroke?.points.map((point) => point.pressure)).toEqual([
    0.2, 0.8,
  ]);
});

test("the stylus eraser button stores an eraser stroke", () => {
  const session = beginStroke(
    emptySession(),
    sample({ buttons: 32 }),
    "pencil",
    "stroke-1"
  );

  expect(session.stroke?.tool).toBe("eraser");
});

test("a finger is dropped while the pen is down", () => {
  const pen = beginStroke(
    emptySession(),
    sample({ pointerId: 1, pointerType: "pen" }),
    "pencil",
    "pen"
  );
  const next = beginStroke(
    pen,
    sample({ pointerId: 2, pointerType: "touch", x: 12 }),
    "pencil",
    "finger"
  );

  expect(next).toBe(pen);
  expect(next.stroke?.id).toBe("pen");
});
