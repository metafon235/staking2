import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  Settings,
  Users,
  Activity,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  id: number;
  email: string;
  isAdmin: boolean;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<AdminUser>({
    queryKey: ['/api/user'],
    retry: false,
    onError: () => {
      setLocation('/auth');
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user?.isAdmin) {
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You need admin privileges to access this area."
    });
    setLocation('/');
    return null;
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      current: location === '/admin'
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
              <p className="text-sm text-muted-foreground">{user.email}</p>
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
                  fetch('/api/logout', { method: 'POST' })
                    .then(() => setLocation('/login'));
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