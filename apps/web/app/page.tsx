"use client";

import { Button } from "@ui-sdk/react/button";
import dynamic from "next/dynamic";
import { useQueryState, parseAsString } from "nuqs";
import { useCallback, useEffect, useState } from "react";

import { DrawTools } from "@/components/storyboard/draw-tools";
import { DrawingProvider } from "@/components/storyboard/drawing";
import {
  FilmReel,
  FilmReelBar,
  FilmReelProject,
  FilmReelScreen,
  FilmReelShot,
} from "@/components/storyboard/film-reel";
import { parseProject } from "@/lib/storyboard/project";
import type { ProjectFile } from "@/lib/storyboard/project";

const ShotBoard = dynamic(
  () =>
    import("@/components/storyboard/shot-board").then((mod) => mod.ShotBoard),
  { ssr: false }
);

const projects = [{ id: "demo", title: "Demo" }];

export default function Page() {
  const [projectId, setProjectId] = useQueryState("project", parseAsString);
  const [project, setProject] = useState<ProjectFile | null>(null);
  const [shotId, setShotId] = useState<string | null>(null);
  const openProject = projectId && project?.id === projectId ? project : null;
  const shot = openProject?.shots.find((item) => item.id === shotId);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          return;
        }
        const next = parseProject(await response.json());
        if (next.isErr()) {
          return;
        }
        setProject(next.value);
        setShotId(next.value.shots[0]?.id ?? null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        throw error;
      }
    };
    void load();

    return () => {
      controller.abort();
    };
  }, [projectId]);

  const saveProject = useCallback((next: ProjectFile) => {
    setProject(next);
    void fetch(`/api/projects/${next.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
  }, []);

  return (
    <main className="flex h-svh flex-col gap-2 p-2">
      <FilmReelScreen>
        {openProject && shotId ? (
          <DrawingProvider
            onProjectChange={saveProject}
            project={openProject}
            shotId={shotId}
          >
            <ShotBoard key={shotId} />
            <FilmReelBar className="border-border-element border-t">
              {shot?.label}
              <DrawTools />
            </FilmReelBar>
          </DrawingProvider>
        ) : null}
      </FilmReelScreen>
      <FilmReel
        aria-label={projectId ? "Shots" : "Projects"}
        bar={
          projectId ? (
            <Button
              className="text-foreground px-2 py-1 text-xs"
              onClick={() => {
                setProject(null);
                setProjectId(null);
              }}
            >
              Projects
            </Button>
          ) : null
        }
        onValueChange={(value) => {
          if (!value) {
            return;
          }
          if (projectId) {
            setShotId(value);
            return;
          }
          setProjectId(value);
        }}
        value={projectId ? shotId : null}
      >
        {openProject
          ? openProject.shots.map((item) => (
              <FilmReelShot key={item.id} value={item.id}>
                {item.label}
              </FilmReelShot>
            ))
          : projects.map((item) => (
              <FilmReelProject key={item.id} value={item.id}>
                {item.title}
              </FilmReelProject>
            ))}
      </FilmReel>
    </main>
  );
}
