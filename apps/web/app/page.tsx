"use client";

import { useState } from "react";

import {
  FilmReel,
  FilmReelScreen,
  FilmReelShot,
} from "@/components/storyboard/film-reel";

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
    <main className="flex h-svh flex-col gap-2 p-2">
      <FilmReelScreen>{shot?.label}</FilmReelScreen>
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
  );
}
