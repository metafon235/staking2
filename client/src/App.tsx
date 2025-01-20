import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import Home from "@/pages/home";
import CoinDetail from "@/pages/coin-detail";
import Portfolio from "@/pages/portfolio";
import Settings from "@/pages/settings";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import Navigation from "@/components/layout/Navigation";
import Analytics from "@/pages/analytics";

// App layout with navigation for authenticated users
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 p-6 lg:pl-72">
        {children}
      </main>
      <div className="h-16 lg:hidden" />
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
      <Route path="/" component={Home} />
      <Route path="/auth">
        {() => user ? <Redirect to="/app" /> : <AuthPage />}
      </Route>
      <Route path="/coins/:symbol" component={CoinDetail} />

      {/* Protected app routes */}
      <Route path="/app">
        {() => !user ? <Redirect to="/auth" /> : <AppLayout><Dashboard /></AppLayout>}
      </Route>
      <Route path="/app/portfolio">
        {() => !user ? <Redirect to="/auth" /> : <AppLayout><Portfolio /></AppLayout>}
      </Route>
      <Route path="/app/coins/:symbol">
        {() => !user ? <Redirect to="/auth" /> : <AppLayout><CoinDetail /></AppLayout>}
      </Route>
      <Route path="/app/analytics">
        {() => !user ? <Redirect to="/auth" /> : <AppLayout><Analytics /></AppLayout>}
      </Route>
      <Route path="/app/settings">
        {() => !user ? <Redirect to="/auth" /> : <AppLayout><Settings /></AppLayout>}
      </Route>

      {/* Admin routes - require both authentication and admin privileges */}
      <Route path="/admin">
        {() => {
          if (!user) return <Redirect to="/auth" />;
          if (!user.isAdmin) return <Redirect to="/app" />;
          return <AdminLayout><AdminDashboard /></AdminLayout>;
        }}
      </Route>
      <Route path="/admin/users">
        {() => {
          if (!user) return <Redirect to="/auth" />;
          if (!user.isAdmin) return <Redirect to="/app" />;
          return <AdminLayout><AdminUsers /></AdminLayout>;
        }}
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