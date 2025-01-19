import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AuthPage from "@/pages/auth-page";
import Home from "@/pages/home";
import CoinDetail from "@/pages/coin-detail";
import Portfolio from "@/pages/portfolio";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import Navigation from "@/components/layout/Navigation";

function Router() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Show home page and coin details for non-authenticated users
  if (!user) {
    return (
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/coins/:symbol" component={CoinDetail} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Show dashboard for authenticated users
  return (
    <div className="flex min-h-screen bg-black">
      <Navigation />
      {/* Main content area with padding for sidebar on desktop */}
      <main className="flex-1 p-6 lg:pl-72">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/coins/:symbol" component={CoinDetail} />
          <Route component={NotFound} />
        </Switch>
      </main>
      {/* Add padding bottom for mobile navigation */}
      <div className="h-16 lg:hidden" />
    </div>
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