import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { SidebarIcon, HomeIcon, ChartBarIcon, WalletIcon, SettingsIcon } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const links = [
    {
      href: "/",
      icon: HomeIcon,
      label: "Home"
    },
    {
      href: "/dashboard",
      icon: ChartBarIcon,
      label: "Dashboard"
    },
    {
      href: "/portfolio",
      icon: WalletIcon,
      label: "Portfolio"
    },
    {
      href: "/settings",
      icon: SettingsIcon,
      label: "Settings"
    }
  ];

  return (
    <div className="w-64 bg-sidebar border-r border-border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <SidebarIcon className="h-6 w-6" />
          <h1 className="font-bold">Multi-Coin Staking</h1>
        </div>

        <nav className="space-y-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer",
                  location === link.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50"
                )}>
                <link.icon className="h-4 w-4" />
                {link.label}
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}