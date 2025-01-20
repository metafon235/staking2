import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AdminAuth from "@/pages/admin/auth";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";

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
      {/* Public routes */}
      <Route path="/" component={AuthPage} />

      {/* Admin routes */}
      <Route path="/admin/login">
        {() => user?.isAdmin ? <Redirect to="/admin/dashboard" /> : <AdminAuth />}
      </Route>
      <Route path="/admin/dashboard">
        {() => !user?.isAdmin ? <Redirect to="/admin/login" /> : (
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        )}
      </Route>

      {/* Fallback */}
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