import { Switch, Route, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminStaking from "@/pages/admin/staking";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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

// Separate RouterContent component to use hooks after QueryClientProvider is set up
function RouterContent() {
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

      {/* Admin routes */}
      <Route path="/admin/login">
        {() => user?.isAdmin ? <Redirect to="/admin" /> : <AdminLogin />}
      </Route>
      <Route path="/admin">
        {() => !user?.isAdmin ? <Redirect to="/admin/login" /> : <AdminDashboard />}
      </Route>
      <Route path="/admin/users">
        {() => !user?.isAdmin ? <Redirect to="/admin/login" /> : <AdminUsers />}
      </Route>
      <Route path="/admin/staking">
        {() => !user?.isAdmin ? <Redirect to="/admin/login" /> : <AdminStaking />}
      </Route>

      {/* Public coin details route */}
      <Route path="/coins/:symbol" component={CoinDetail} />

      {/* Protected app routes */}
      <Route path="/app">
        {() => !user ? <Redirect to="/auth" /> : <AppLayout><Dashboard /></AppLayout>}
      </Route>
      <Route path="/app/portfolio">
        {() => !user ? <Redirect to="/auth" /> : <AppLayout><Portfolio /></AppLayout>}
      </Route>
      <Route path="/app/coins/:symbol">
        {() => !user ? <Redirect to="/auth" /> : (
          <AppLayout>
            <CoinDetail />
          </AppLayout>
        )}
      </Route>
      <Route path="/app/analytics">
        {() => !user ? <Redirect to="/auth" /> : <AppLayout><Analytics /></AppLayout>}
      </Route>
      <Route path="/app/settings">
        {() => !user ? <Redirect to="/auth" /> : <AppLayout><Settings /></AppLayout>}
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Main App component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterContent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;