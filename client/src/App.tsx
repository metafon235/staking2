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
      <Route path="/auth">
        {() => user ? <Redirect to="/app" /> : <AuthPage />}
      </Route>

      {/* Protected app routes */}
      <Route path="/app">
        {() => {
          if (!user) return <Redirect to="/auth" />;

          return (
            <AppLayout>
              <Switch>
                <Route path="/app">
                  <Dashboard />
                </Route>
                <Route path="/app/portfolio">
                  <Portfolio />
                </Route>
                <Route path="/app/coins/:symbol">
                  <CoinDetail />
                </Route>
                <Route path="/app/analytics">
                  <Analytics />
                </Route>
                <Route path="/app/settings">
                  <Settings />
                </Route>
                <Route>
                  <NotFound />
                </Route>
              </Switch>
            </AppLayout>
          );
        }}
      </Route>

      {/* Fallback */}
      <Route>
        <NotFound />
      </Route>
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