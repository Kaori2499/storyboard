"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme-provider";

const Providers = ({ children }: { children: ReactNode }) => (
  <NuqsAdapter>
    <ThemeProvider>{children}</ThemeProvider>
  </NuqsAdapter>
);

export { Providers };
