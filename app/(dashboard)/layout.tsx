"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { UploadProgressPanel } from "@/components/layout/UploadProgressPanel";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuthStore } from "@/stores/authStore";
import { useUploadWebSocket } from "@/hooks/useUploadWebSocket";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checkAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  
  // Manage polling for upload job status updates
  useUploadWebSocket();

  useEffect(() => {
    checkAuth();
    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => {
      setIsChecking(false);
    }, 0);
  }, [checkAuth]);

  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      router.push("/login");
    }
  }, [isChecking, isAuthenticated, router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col ml-60">
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
      <UploadProgressPanel />
    </ErrorBoundary>
  );
}

