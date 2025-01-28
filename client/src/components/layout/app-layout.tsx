import { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex">
      <div className="fixed top-0 left-0 h-screen">
        <Sidebar />
      </div>
      <main className="flex-1 ml-64 bg-black min-h-screen">
        {children}
      </main>
    </div>
  );
}