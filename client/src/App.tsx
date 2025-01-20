import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Navigation from "@/components/layout/Navigation";
import { useUser } from "@/hooks/use-user";
import React from "react";

console.log("App component is rendering");

// App layout with navigation for authenticated users
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-900">
      <Navigation />
      <main className="flex-1 p-8 lg:pl-72">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}

function Router() {
  const { user } = useUser();
  console.log("Router component is rendering, user:", user);

  return (
    <Switch>
      {/* Public home page */}
      <Route path="/">
        {() => user ? <Redirect to="/dashboard" /> : <Home />}
      </Route>

      {/* Dashboard - protected route */}
      <Route path="/dashboard">
        {() => !user ? <Redirect to="/auth" /> : (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        )}
      </Route>

      {/* 404 fallback */}
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