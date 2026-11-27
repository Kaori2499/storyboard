import { fireEvent, render, screen } from "@testing-library/react";
import { createAgent } from "@ui-sdk/react/agent";
import { useState } from "react";
import { expect, test, vi } from "vitest";

import {
  FilmReel,
  FilmReelBar,
  FilmReelScreen,
  FilmReelShot,
} from "./film-reel";

const shots = [
  { id: "wide", label: "Wide" },
  { id: "close", label: "Close" },
];

const agent = createAgent();

const Reel = ({
  onValueChange,
}: {
  onValueChange?: (value: string | null) => void;
}) => (
  <FilmReel
    aria-label="Shots"
    defaultValue="wide"
    onValueChange={onValueChange}
  >
    {shots.map((shot) => (
      <FilmReelShot key={shot.id} value={shot.id}>
        {shot.label}
      </FilmReelShot>
    ))}
  </FilmReel>
);

test("a vertical wheel moves the reel sideways", () => {
  render(<Reel />);

  const reel = screen.getByRole("listbox", { name: "Shots" });
  let left = 0;
  Object.defineProperty(reel, "scrollWidth", {
    configurable: true,
    value: 800,
  });
  Object.defineProperty(reel, "clientWidth", {
    configurable: true,
    value: 200,
  });
  Object.defineProperty(reel, "scrollLeft", {
    configurable: true,
    get: () => left,
    set: (value: number) => {
      left = value;
    },
  });

  fireEvent.wheel(reel, { deltaX: 0, deltaY: 40 });

  expect(
    document.querySelector("[data-slot='scroll-area-scrollbar']")
  ).toBeNull();
  expect(left).toBe(40);
});

const ScreenedReel = () => {
  const [shotId, setShotId] = useState("wide");
  const label = shots.find((shot) => shot.id === shotId)?.label;

  return (
    <>
      <FilmReelScreen>
        <FilmReelBar className="border-border-element border-t">
          {label}
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
        {shots.map((shot) => (
          <FilmReelShot key={shot.id} value={shot.id}>
            {shot.label}
          </FilmReelShot>
        ))}
      </FilmReel>
    </>
  );
};

test("screen, reel, and shot put their label in a bottom bar", () => {
  render(<ScreenedReel />);

  const display = screen.getByRole("status", { name: "Selected shot" });
  const reel = screen.getByRole("listbox", { name: "Shots" }).parentElement;
  const wide = screen.getByRole("option", { name: "Wide" });
  const screenBar = display.querySelector("[data-slot='film-reel-bar']");
  const reelBar = reel?.querySelector(":scope > [data-slot='film-reel-bar']");
  const shotBar = wide.querySelector("[data-slot='film-reel-bar']");

  expect(screenBar?.className).toContain("border-t");
  expect(reelBar?.className).toContain("border-t");
  expect(shotBar?.className.includes("border-t")).toBe(false);

  expect(
    display.querySelector("[data-slot='film-reel-bar']")?.textContent
  ).toBe("Wide");
  expect(wide.querySelector("[data-slot='film-reel-bar']")?.textContent).toBe(
    "Wide"
  );
});

test("the screen shows the selected shot", () => {
  render(<ScreenedReel />);

  const display = screen.getByRole("status", { name: "Selected shot" });
  expect(display.textContent).toBe("Wide");

  fireEvent.click(screen.getByRole("option", { name: "Close" }));

  expect(display.textContent).toBe("Close");
});

test("the right arrow selects the next shot", () => {
  render(<Reel />);

  const wide = screen.getByRole("option", { name: "Wide" });
  wide.focus();
  fireEvent.keyDown(wide, { key: "ArrowRight" });

  expect(
    screen.getByRole("option", { name: "Close" }).getAttribute("aria-selected")
  ).toBe("true");
});

test("choosing a shot calls onValueChange", () => {
  const onValueChange = vi.fn();
  render(<Reel onValueChange={onValueChange} />);

  fireEvent.click(screen.getByRole("option", { name: "Close" }));

  expect(onValueChange).toHaveBeenCalled();
  expect(onValueChange.mock.calls[0]?.[0]).toBe("close");
});

test("an agent can find the reel and select a shot", async () => {
  render(<Reel />);

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
  expect(labels, "Shots is missing from the snapshot").toContain("Shots");

  const reel = components.find((entry) => entry.label === "Shots");
  const close = reel?.items?.find((item) => item.label === "Close");
  expect(close?.value).toBeTruthy();

  const result = await agent.act({
    steps: [{ ref: "Shots", action: "setValue", args: [close?.value] }],
  });

  expect(result.ok, result.error?.message).toBe(true);
  expect(
    screen.getByRole("option", { name: "Close" }).getAttribute("aria-selected")
  ).toBe("true");
});
