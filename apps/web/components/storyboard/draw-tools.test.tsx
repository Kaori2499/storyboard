import { render, screen } from "@testing-library/react";
import { createAgent } from "@ui-sdk/react/agent";
import { expect, test } from "vitest";

import { DrawTools } from "./draw-tools";
import { DrawingProvider } from "./drawing";
import { FilmReelBar } from "./film-reel";

const agent = createAgent();

test("an agent can find the pencil and eraser in the screen bar", () => {
  render(
    <DrawingProvider shotId="wide">
      <FilmReelBar>
        Wide
        <DrawTools />
      </FilmReelBar>
    </DrawingProvider>
  );

  const bar = document.querySelector("[data-slot='film-reel-bar']");
  const pencil = screen.getByRole("button", { name: "Pencil" });
  const eraser = screen.getByRole("button", { name: "Eraser" });

  expect(bar?.contains(pencil)).toBe(true);
  expect(bar?.contains(eraser)).toBe(true);

  const components = agent
    .snapshot()
    .filter((entry) => !entry.offPage && entry.component !== "more");

  for (const entry of components) {
    expect(
      entry.label,
      `${entry.component} ${entry.ref} has no name`
    ).toBeTruthy();
  }

  const labels = components.map((entry) => entry.label);
  expect(labels, "Drawing is missing from the snapshot").toContain("Drawing");
  expect(labels).toContain("Pencil");
  expect(labels).toContain("Eraser");
});
