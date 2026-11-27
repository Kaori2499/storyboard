"use client";

import { Listbox, ListboxItem } from "@ui-sdk/react/listbox";
import type { ListboxProps } from "@ui-sdk/react/listbox";
import { cn } from "@workspace/ui/lib/utils";
import { useEffect, useRef } from "react";
import type { ComponentProps, ReactNode } from "react";

type FilmReelProps = Omit<
  Extract<ListboxProps<string, false>, { multiple?: false }>,
  "multiple" | "orientation"
> & {
  bar?: ReactNode;
};

const lineHeight = 16;

const filmReelWireframe =
  "border-border-divider bg-surface-canvas text-foreground flex flex-col rounded-none border";

const FilmReelWireframe = ({ className, ...props }: ComponentProps<"div">) => (
  <div {...props} className={cn(filmReelWireframe, className)} />
);

const FilmReelBar = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    {...props}
    className={cn(
      "mt-auto flex min-h-8 w-full shrink-0 items-center px-2 py-1.5 text-xs",
      className
    )}
    data-slot="film-reel-bar"
  />
);

const FilmReel = ({ bar, className, children, ...props }: FilmReelProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      if (scroller.scrollWidth <= scroller.clientWidth) {
        return;
      }
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }
      event.preventDefault();
      const distance =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? event.deltaY * lineHeight
          : event.deltaY;
      scroller.scrollLeft += distance;
    };

    scroller.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      scroller.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div
      className={cn(
        filmReelWireframe,
        "h-[clamp(6.5rem,18svh,12rem)] w-full shrink-0",
        className
      )}
      data-slot="film-reel"
    >
      <Listbox
        {...props}
        className="flex min-h-0 w-full flex-1 [scrollbar-width:none] items-stretch gap-3 overflow-x-auto p-2 [&::-webkit-scrollbar]:hidden"
        multiple={false}
        orientation="horizontal"
        ref={scrollerRef}
      >
        {children}
      </Listbox>
      <FilmReelBar className="border-border-element border-t">
        {bar}
      </FilmReelBar>
    </div>
  );
};

const FilmReelScreen = ({
  className,
  children,
  ...props
}: ComponentProps<"output">) => (
  <output
    {...props}
    aria-label="Selected shot"
    className={cn(filmReelWireframe, "min-h-0 w-full flex-1", className)}
  >
    {children}
  </output>
);

const FilmReelShot = ({
  className,
  children,
  ...props
}: ComponentProps<typeof ListboxItem>) => (
  <ListboxItem
    {...props}
    className={cn(
      filmReelWireframe,
      "border-border-element text-muted-foreground focus-visible:outline-ring data-[selected]:bg-foreground data-[selected]:text-primary-foreground aspect-video h-full shrink-0 text-xs font-medium focus-visible:outline-2",
      className
    )}
  >
    {(state) => (
      <FilmReelBar>
        {typeof children === "function" ? children(state) : children}
      </FilmReelBar>
    )}
  </ListboxItem>
);

const FilmReelProject = ({
  className,
  children,
  ...props
}: ComponentProps<typeof ListboxItem>) => (
  <ListboxItem
    {...props}
    className={cn(
      filmReelWireframe,
      "border-border-element text-muted-foreground focus-visible:outline-ring data-[selected]:bg-foreground data-[selected]:text-primary-foreground aspect-video h-full shrink-0 text-xs font-medium focus-visible:outline-2",
      className
    )}
  >
    {(state) => (
      <FilmReelBar>
        {typeof children === "function" ? children(state) : children}
      </FilmReelBar>
    )}
  </ListboxItem>
);

export {
  FilmReel,
  FilmReelBar,
  FilmReelProject,
  FilmReelScreen,
  FilmReelShot,
  FilmReelWireframe,
};
