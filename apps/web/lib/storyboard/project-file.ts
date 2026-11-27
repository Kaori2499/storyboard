import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { errAsync, Result, ResultAsync } from "neverthrow";

import { parseProject } from "@/lib/storyboard/project";
import type { ProjectError, ProjectFile } from "@/lib/storyboard/project";

const projectIdPattern = /^[a-z0-9-]+$/u;

const filePath = (id: string) =>
  path.join(process.cwd(), "public", "projects", `${id}.json`);

const readError = (id: string, cause: unknown): ProjectError => {
  if (
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    cause.code === "ENOENT"
  ) {
    return { kind: "not_found", id };
  }
  return { kind: "io" };
};

const readProject = (id: string): ResultAsync<ProjectFile, ProjectError> => {
  if (!projectIdPattern.test(id)) {
    return errAsync<ProjectFile, ProjectError>({ kind: "invalid" });
  }

  const parseJson = Result.fromThrowable(
    (text: string) => JSON.parse(text) as unknown,
    (): ProjectError => ({ kind: "invalid" })
  );

  return ResultAsync.fromPromise(readFile(filePath(id), "utf-8"), (cause) =>
    readError(id, cause)
  ).andThen((text) => parseJson(text).andThen(parseProject));
};

const writeProject = (
  project: ProjectFile
): ResultAsync<ProjectFile, ProjectError> =>
  parseProject(project).asyncAndThen((parsed) => {
    if (!projectIdPattern.test(parsed.id)) {
      return errAsync<ProjectFile, ProjectError>({ kind: "invalid" });
    }

    return ResultAsync.fromPromise(
      writeFile(filePath(parsed.id), `${JSON.stringify(parsed, null, 2)}\n`),
      (): ProjectError => ({ kind: "io" })
    ).map(() => parsed);
  });

export { readProject, writeProject };
