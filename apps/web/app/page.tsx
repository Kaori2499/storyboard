"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { DrawTools } from "@/components/storyboard/draw-tools";
import { DrawingProvider } from "@/components/storyboard/drawing";
import {
  FilmReel,
  FilmReelBar,
  FilmReelScreen,
  FilmReelShot,
} from "@/components/storyboard/film-reel";

const ShotBoard = dynamic(
  () =>
    import("@/components/storyboard/shot-board").then((mod) => mod.ShotBoard),
  { ssr: false }
);

const shots = [
  { id: "wide", label: "Wide" },
  { id: "close", label: "Close" },
  { id: "insert", label: "Insert" },
  { id: "exit", label: "Exit" },
];

export default function Page() {
  const [shotId, setShotId] = useState("wide");
  const shot = shots.find((item) => item.id === shotId);

  return (
    <DrawingProvider shotId={shotId}>
      <main className="flex h-svh flex-col gap-2 p-2">
        <FilmReelScreen>
          <ShotBoard key={shotId} />
          <FilmReelBar className="border-border-element border-t">
            {shot?.label}
            <DrawTools />
          </FilmReelBar>
        </FilmReelScreen>
        <FilmReel
          aria-label="Shots"
          onValueChange={(value) => {
            if (value) {
              setShotId(value);
            }
          }}
          value={shotId}
        >
          {shots.map((item) => (
            <FilmReelShot key={item.id} value={item.id}>
              {item.label}
            </FilmReelShot>
          ))}
        </FilmReel>
      </main>
    </DrawingProvider>
  );
}
