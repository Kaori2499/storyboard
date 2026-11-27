import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { NextResponse } from "next/server";

import { parseProject } from "@/lib/storyboard/project";
import type { ProjectError, ProjectFile } from "@/lib/storyboard/project";
import { readProject, writeProject } from "@/lib/storyboard/project-file";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export const dynamic = "force-dynamic";

const statusFor = (error: ProjectError) => {
  if (error.kind === "not_found") {
    return 404;
  }
  if (error.kind === "invalid") {
    return 400;
  }
  return 500;
};

const responseFor = (project: ProjectFile) => NextResponse.json(project);

const errorResponse = (error: ProjectError) =>
  NextResponse.json({ error: error.kind }, { status: statusFor(error) });

const GET = async (_request: Request, context: RouteContext) => {
  const { projectId } = await context.params;
  const project = await readProject(projectId);
  return project.match(responseFor, errorResponse);
};

const PUT = async (request: Request, context: RouteContext) => {
  const { projectId } = await context.params;
  const saved = await ResultAsync.fromPromise(
    request.json(),
    (): ProjectError => ({ kind: "invalid" })
  )
    .andThen(parseProject)
    .andThen((project) =>
      project.id === projectId
        ? okAsync<ProjectFile, ProjectError>(project)
        : errAsync<ProjectFile, ProjectError>({ kind: "invalid" })
    )
    .andThen(writeProject);

  return saved.match(responseFor, errorResponse);
};

export { GET, PUT };
