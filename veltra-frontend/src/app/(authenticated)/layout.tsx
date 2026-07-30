"use client";

import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { Sidebar } from "@/components/sidebar";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

function AuthGuard({ children }: { children: ReactNode }) {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state === "unauthenticated") {
      router.push("/login");
    }
  }, [state, router]);

  if (state === "loading" || state === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-on-surface-variant">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="flex h-screen overflow-hidden bg-surface">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
