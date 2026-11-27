"use client";

import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Layer, Shape, Stage } from "react-konva";

import { useDrawing } from "@/components/storyboard/drawing";
import {
  beginStroke,
  emptySession,
  endStroke,
  extendStroke,
  strokeOutline,
} from "@/lib/storyboard/strokes";
import type { PointerSample, Stroke } from "@/lib/storyboard/strokes";

Konva.pixelRatio =
  typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;

const pixelRatio = () =>
  typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;

const ShotBoard = () => {
  const {
    actions: { addStroke },
    state: { strokes, tool },
  } = useDrawing();
  const hostRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef(emptySession());
  const toolRef = useRef(tool);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [ink, setInk] = useState("canvastext");
  const [live, setLive] = useState<Stroke | null>(null);

  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    setInk(getComputedStyle(host).color);

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }

      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const samplesFrom = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = hostRef.current?.getBoundingClientRect();
    const native = event.nativeEvent;
    const coalesced =
      typeof native.getCoalescedEvents === "function"
        ? native.getCoalescedEvents()
        : [];
    const events = coalesced.length > 0 ? coalesced : [native];

    return events.map((item): PointerSample => ({
      pointerId: item.pointerId,
      pointerType: item.pointerType,
      x: item.clientX - (rect?.left ?? 0),
      y: item.clientY - (rect?.top ?? 0),
      pressure: item.pressure,
      buttons: item.buttons,
    }));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const [first, ...rest] = samplesFrom(event);
    if (!first) {
      return;
    }

    const started = beginStroke(
      sessionRef.current,
      first,
      toolRef.current,
      crypto.randomUUID()
    );
    if (started === sessionRef.current) {
      return;
    }

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {
      if (!(error instanceof DOMException)) {
        throw error;
      }
    }
    const next = extendStroke(started, rest);
    sessionRef.current = next;
    setLive(next.stroke);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (sessionRef.current.penId !== event.pointerId) {
      return;
    }

    const next = extendStroke(sessionRef.current, samplesFrom(event));
    if (next === sessionRef.current) {
      return;
    }

    sessionRef.current = next;
    setLive(next.stroke);
  };

  const finish = (event: ReactPointerEvent<HTMLDivElement>) => {
    const result = endStroke(sessionRef.current, event.pointerId);
    sessionRef.current = result.session;
    setLive(null);
    if (result.stroke) {
      addStroke(result.stroke);
    }
  };

  const drawn = live ? [...strokes, live] : strokes;

  return (
    <div className="relative min-h-0 w-full flex-1" ref={hostRef}>
      <div
        className="absolute inset-0 touch-none"
        onPointerCancel={finish}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
      >
        {size.width > 0 && size.height > 0 ? (
          <Stage
            height={size.height}
            pixelRatio={pixelRatio()}
            width={size.width}
          >
            <Layer>
              {drawn.map((stroke) => (
                <StrokeShape ink={ink} key={stroke.id} stroke={stroke} />
              ))}
            </Layer>
          </Stage>
        ) : null}
      </div>
    </div>
  );
};

const StrokeShape = ({ stroke, ink }: { ink: string; stroke: Stroke }) => (
  <Shape
    fill={ink}
    globalCompositeOperation={
      stroke.tool === "eraser" ? "destination-out" : "source-over"
    }
    listening={false}
    perfectDrawEnabled={false}
    sceneFunc={(context, shape) => {
      const outline = strokeOutline(stroke);
      const [start, ...rest] = outline;
      if (!start) {
        return;
      }

      context.beginPath();
      context.moveTo(start[0] ?? 0, start[1] ?? 0);
      for (const point of rest) {
        context.lineTo(point[0] ?? 0, point[1] ?? 0);
      }
      context.closePath();
      context.fillStrokeShape(shape);
    }}
  />
);

export { ShotBoard };
