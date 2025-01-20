import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  Settings,
  Users,
  Activity,
  LogOut,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { SelectUser } from "@db/schema";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: adminSession, isLoading } = useQuery<{ user: SelectUser }>({
    queryKey: ['/api/admin/session'],
    retry: 1,
    refetchOnWindowFocus: false,
    onError: () => {
      toast({
        variant: "destructive",
        title: "Nicht autorisiert",
        description: "Bitte melden Sie sich als Administrator an."
      });
      setLocation('/admin/login');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminSession?.user.isAdmin) {
    return null;
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      current: location === '/admin/dashboard'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      current: location === '/admin/users'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      current: location === '/admin/settings'
    },
    {
      name: 'Activity',
      href: '/admin/activity',
      icon: Activity,
      current: location === '/admin/activity'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm">
          <div className="h-full px-3 py-4">
            <div className="mb-8 px-3">
              <h2 className="text-lg font-semibold">Admin Panel</h2>
              <p className="text-sm text-muted-foreground">{adminSession.user.email}</p>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className={`
                    w-full justify-start px-3 py-2 text-sm
                    ${item.current 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                  onClick={() => setLocation(item.href)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              ))}
            </nav>

            <div className="absolute bottom-4 w-56">
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={() => {
                  fetch('/api/admin/logout', { 
                    method: 'POST',
                    credentials: 'include'
                  }).then(() => {
                    setLocation('/admin/login');
                    // Invalidate admin session
                    queryClient.invalidateQueries({ queryKey: ['/api/admin/session'] });
                  });
                }}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}