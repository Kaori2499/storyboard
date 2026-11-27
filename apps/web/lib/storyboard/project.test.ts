import { err, ok } from "neverthrow";
import { expect, test } from "vitest";

import { parseProject } from "./project";

const demo = {
  version: 1,
  id: "demo",
  title: "Demo",
  shots: [{ id: "wide", label: "Wide", strokes: [] }],
};

test("a demo project file parses", () => {
  expect(parseProject(demo)).toEqual(ok(demo));
});

test("a shot without strokes fails", () => {
  expect(
    parseProject({
      ...demo,
      shots: [{ id: "wide", label: "Wide" }],
    })
  ).toEqual(err({ kind: "invalid" }));
});
