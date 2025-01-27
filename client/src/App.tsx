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