import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Portfolio from "@/pages/portfolio";
import CoinDetail from "@/pages/coin-detail";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import CoinsOverview from "@/pages/coins";
import { queryClient } from "./lib/queryClient";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";

// Admin Pages
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminStaking from "@/pages/admin/staking";
import AdminUsers from "@/pages/admin/users";

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/auth');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return user ? <Component /> : null;
}

function AdminProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      setLocation('/admin/login');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return user?.isAdmin ? <Component /> : null;
}

function Router() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/auth">
        {() => (user ? <Dashboard /> : <AuthPage />)}
      </Route>
      <Route path="/coins/:symbol">
        {(params) => <CoinDetail symbol={params.symbol} />}
      </Route>

      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        {() => <AdminProtectedRoute component={AdminDashboard} />}
      </Route>
      <Route path="/admin/staking">
        {() => <AdminProtectedRoute component={AdminStaking} />}
      </Route>
      <Route path="/admin/users">
        {() => <AdminProtectedRoute component={AdminUsers} />}
      </Route>

      {/* Protected routes */}
      <Route path="/app">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/app/portfolio">
        {() => <ProtectedRoute component={Portfolio} />}
      </Route>
      <Route path="/app/coins">
        {() => <ProtectedRoute component={CoinsOverview} />}
      </Route>
      <Route path="/app/coins/:symbol">
        {(params) => <ProtectedRoute component={() => <CoinDetail symbol={params.symbol} />} />}
      </Route>
      <Route path="/app/analytics">
        {() => <ProtectedRoute component={Analytics} />}
      </Route>
      <Route path="/app/settings">
        {() => <ProtectedRoute component={Settings} />}
      </Route>
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>

      {/* Fallback to 404 */}
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