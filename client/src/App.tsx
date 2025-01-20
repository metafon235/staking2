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
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import Navigation from "@/components/layout/Navigation";
import Analytics from "@/pages/analytics";

// Protected route wrapper component
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any> }) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component {...rest} />;
}

// App layout with navigation for authenticated users
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-black">
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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />

      {/* Protected app routes - note the explicit paths */}
      <Route path="/app">
        {() => !user ? <Redirect to="/auth" /> : (
          <AppLayout>
            <Switch>
              <Route path="/app" component={Dashboard} />
              <Route path="/app/portfolio" component={Portfolio} />
              <Route path="/app/coins/:symbol" component={CoinDetail} />
              <Route path="/app/analytics" component={Analytics} />
              <Route path="/app/settings" component={Settings} />
              <Route path="/app/*">
                <NotFound />
              </Route>
            </Switch>
          </AppLayout>
        )}
      </Route>

      {/* Fallback */}
      <Route path="*" component={NotFound} />
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