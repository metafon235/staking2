import { Home, LineChart, Coins, Settings, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Coins, label: "Coins", href: "/coins/eth" },
  { icon: LineChart, label: "Analytics", href: "/analytics" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Navigation() {
  const [location] = useLocation();
  const { user } = useUser();

  if (!user) return null;

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-zinc-800 bg-zinc-900">
        <SidebarHeader>
          <div className="flex h-16 items-center justify-between px-4">
            <span className="text-xl font-bold text-white">Staking App</span>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <nav className="flex-1 space-y-2 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;

              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive 
                      ? "bg-purple-600 text-white" 
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </SidebarContent>
      </Sidebar>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 z-40 h-16 w-full border-t border-zinc-800 bg-zinc-900 lg:hidden">
        <div className="grid h-full grid-cols-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1",
                  isActive
                    ? "text-purple-600"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </SidebarProvider>
  );
}