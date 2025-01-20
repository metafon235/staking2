import { Home, LineChart, Coins, Settings, Menu, LogOut, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
import NotificationBell from "./NotificationBell";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/app" },
  { icon: Wallet, label: "Portfolio", href: "/app/portfolio" },
  { icon: Coins, label: "Coins", href: "/app/coins/eth" },
  { icon: LineChart, label: "Analytics", href: "/app/analytics" },
  { icon: Settings, label: "Settings", href: "/app/settings" },
];

export default function Navigation() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useUser();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";  // Use full page refresh on logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Helper function to check if a menu item is active
  const isMenuItemActive = (href: string) => {
    if (href === "/app") {
      return location === "/app";
    }
    return location.startsWith(href + "/") || location === href;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 hidden lg:block",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex h-full flex-col border-r border-zinc-800 bg-zinc-900">
          <div className="flex h-16 items-center justify-between px-4">
            {!isCollapsed && (
              <span className="text-xl font-bold text-white">Staking App</span>
            )}
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-zinc-400 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isMenuItemActive(item.href);

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
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-colors",
                "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              )}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </nav>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 z-40 h-16 w-full border-t border-zinc-800 bg-zinc-900 lg:hidden">
        <div className="grid h-full grid-cols-6"> {/* Changed to 6 columns to accommodate NotificationBell */}
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = isMenuItemActive(item.href);

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

          <div className="flex flex-col items-center justify-center">
            <NotificationBell />
          </div>

          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center space-y-1 text-zinc-400 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}