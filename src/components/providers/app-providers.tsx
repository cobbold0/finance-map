"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { PwaProvider } from "@/components/providers/pwa-provider";
import { createQueryClient } from "@/lib/query-client";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <PwaProvider>{children}</PwaProvider>
    </QueryClientProvider>
  );
}
