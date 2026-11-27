import { getStroke } from "perfect-freehand";

type DrawTool = "pencil" | "eraser";

interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
}

interface Stroke {
  id: string;
  tool: DrawTool;
  points: StrokePoint[];
}

interface PointerSample {
  pointerId: number;
  pointerType: string;
  x: number;
  y: number;
  pressure: number;
  buttons: number;
}

interface DrawSession {
  penId: number | null;
  pointerType: string | null;
  stroke: Stroke | null;
}

const eraserButton = 32;

const hasEraserButton = (buttons: number) =>
  Math.trunc(buttons / eraserButton) % 2 === 1;

const emptySession = (): DrawSession => ({
  penId: null,
  pointerType: null,
  stroke: null,
});

const isPalm = (session: DrawSession, sample: PointerSample) =>
  session.pointerType === "pen" &&
  sample.pointerType === "touch" &&
  sample.pointerId !== session.penId;

const pressureOf = (pressure: number) => (pressure > 0 ? pressure : 0.5);

const pointOf = (sample: PointerSample): StrokePoint => ({
  x: sample.x,
  y: sample.y,
  pressure: pressureOf(sample.pressure),
});

const beginStroke = (
  session: DrawSession,
  sample: PointerSample,
  tool: DrawTool,
  id: string
): DrawSession => {
  if (session.penId !== null || isPalm(session, sample)) {
    return session;
  }

  return {
    penId: sample.pointerId,
    pointerType: sample.pointerType,
    stroke: {
      id,
      tool: hasEraserButton(sample.buttons) ? "eraser" : tool,
      points: [pointOf(sample)],
    },
  };
};

const extendStroke = (
  session: DrawSession,
  samples: PointerSample[]
): DrawSession => {
  if (!session.stroke) {
    return session;
  }

  const points = samples
    .filter(
      (sample) => sample.pointerId === session.penId && !isPalm(session, sample)
    )
    .map(pointOf);

  if (points.length === 0) {
    return session;
  }

  return {
    ...session,
    stroke: {
      ...session.stroke,
      points: [...session.stroke.points, ...points],
    },
  };
};

const endStroke = (
  session: DrawSession,
  pointerId: number
): { session: DrawSession; stroke: Stroke | null } => {
  if (session.penId !== pointerId || !session.stroke) {
    return { session, stroke: null };
  }

  return { session: emptySession(), stroke: session.stroke };
};

const strokeOutline = (stroke: Stroke) =>
  getStroke(
    stroke.points.map((point) => [point.x, point.y, point.pressure]),
    {
      size: stroke.tool === "eraser" ? 28 : 8,
      thinning: stroke.tool === "eraser" ? 0 : 0.6,
      smoothing: 0.5,
      streamline: 0.5,
    }
  );

export { beginStroke, emptySession, endStroke, extendStroke, strokeOutline };
export type { DrawSession, DrawTool, PointerSample, Stroke, StrokePoint };
