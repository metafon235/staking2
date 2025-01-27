import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Wallet,
  Trophy,
  Settings,
  LogOut,
  Coins,
  BarChart2,
  Briefcase
} from "lucide-react";
import { useUser } from "@/hooks/use-user";

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useUser();

  const menuItems = [
    { href: "/app", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/portfolio", label: "Portfolio", icon: Briefcase },
    { href: "/app/coins", label: "Coins", icon: Coins },
    { href: "/app/staking", label: "Staking", icon: Wallet },
    { href: "/app/rewards", label: "Rewards", icon: Trophy },
    { href: "/app/analytics", label: "Analytics", icon: BarChart2 },
    { href: "/app/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="h-screen w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">PIVX Staking</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800",
                  location === item.href && "bg-zinc-800 text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}