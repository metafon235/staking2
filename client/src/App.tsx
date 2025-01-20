import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AdminAuth from "@/pages/admin/auth";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";

// App layout with navigation for authenticated users
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}

function Router() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Admin routes - these should be checked first */}
      <Route path="/admin/login" component={AdminAuth} />
      <Route path="/admin/dashboard">
        {() => (
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <AdminLayout>
            <AdminUsers />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin">
        {() => <Redirect to="/admin/dashboard" />}
      </Route>

      {/* Public routes */}
      <Route path="/auth">
        {() => user ? <Redirect to="/dashboard" /> : <AuthPage />}
      </Route>

      {/* Protected routes */}
      <Route path="/dashboard">
        {() => !user ? <Redirect to="/auth" /> : (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        )}
      </Route>

      {/* Home route should be last of the defined routes */}
      <Route path="/" component={Home} />

      {/* Fallback 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;