import { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-black min-h-screen">
        {children}
      </main>
    </div>
  );
}
