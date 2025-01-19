import { Home, LineChart, Coins, Settings, Menu, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation, useLocation as useLocationHook } from "wouter";
import { useUser } from "@/hooks/use-user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Coins, label: "Coins", href: "/coins/eth" },
  { icon: LineChart, label: "Analytics", href: "/analytics" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Navigation() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location, setLocation] = useLocationHook();
  const { user, logout } = useUser();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/"); // Redirect to home page after successful logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-zinc-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

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
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Menu - Desktop */}
          <div className="p-4 border-t border-zinc-800">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-zinc-400 hover:text-white"
                >
                  <User className="h-5 w-5 mr-2" />
                  {!isCollapsed && <span>{user.username}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 z-40 h-16 w-full border-t border-zinc-800 bg-zinc-900 lg:hidden">
        <div className="grid h-full grid-cols-5">
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

          {/* User Menu - Mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center justify-center space-y-1 text-zinc-400 hover:text-white">
                <User className="h-5 w-5" />
                <span className="text-xs">Account</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top">
              <DropdownMenuItem className="text-sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </>
  );
}