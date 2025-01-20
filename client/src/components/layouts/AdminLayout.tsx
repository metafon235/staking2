import { useQuery } from "@tanstack/react-query";
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

interface AdminSession {
  user: {
    id: number;
    email: string;
    isAdmin: boolean;
  };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: session, isLoading } = useQuery<AdminSession>({
    queryKey: ['/api/admin/session'],
    queryFn: async () => {
      console.log('Checking admin session...');
      const response = await fetch('/api/admin/session', {
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Session check failed:', response.status);
        throw new Error('Session check failed');
      }

      const data = await response.json();
      console.log('Admin session data:', data);
      return data;
    },
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 30000 // Check session every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    console.log('No admin session found, redirecting to login');
    setLocation('/admin/login');
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

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      setLocation('/admin/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout fehlgeschlagen",
        description: "Bitte versuchen Sie es erneut."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm">
          <div className="h-full px-3 py-4">
            <div className="mb-8 px-3">
              <h2 className="text-lg font-semibold">Admin Panel</h2>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant={item.current ? "default" : "ghost"}
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
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}