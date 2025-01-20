import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AdminAuth from "@/pages/admin/auth";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminActivity from "@/pages/admin/activity";
import AdminSettings from "@/pages/admin/settings";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Navigation from "@/components/layout/Navigation";

// App layout with navigation for authenticated users
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 p-6 lg:pl-64">
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
      <Route path="/admin/activity">
        {() => (
          <AdminLayout>
            <AdminActivity />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/settings">
        {() => (
          <AdminLayout>
            <AdminSettings />
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

      {/* Protected user routes */}
      <Route path="/dashboard">
        {() => !user ? <Redirect to="/auth" /> : (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        )}
      </Route>

      <Route path="/portfolio">
        {() => !user ? <Redirect to="/auth" /> : (
          <AppLayout>
            <div>Portfolio Page</div>
          </AppLayout>
        )}
      </Route>

      <Route path="/analytics">
        {() => !user ? <Redirect to="/auth" /> : (
          <AppLayout>
            <div>Analytics Page</div>
          </AppLayout>
        )}
      </Route>

      <Route path="/settings">
        {() => !user ? <Redirect to="/auth" /> : (
          <AppLayout>
            <div>Settings Page</div>
          </AppLayout>
        )}
      </Route>

      {/* Home route should be at the root */}
      <Route path="/">
        {() => user ? <Redirect to="/dashboard" /> : <Home />}
      </Route>

      {/* Fallback 404 - should be last */}
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