"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        {children}
      </QueryProvider>
    </AuthProvider>
  );
}