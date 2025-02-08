import React from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Garden from "@/pages/garden";
import Plants from "@/pages/plants";
import Settings from "@/pages/settings";
import Onboarding from "@/pages/onboarding";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/garden" />} />
      <Route path="/auth" component={AuthPage} />
      <Route
        path="/onboarding"
        component={() => {
          const location = useLocation()[0];
          const { user } = useAuth();

          // Redirect to garden if user has already completed onboarding
          if (user?.gardenSpace && location === "/onboarding") {
            return <Redirect to="/garden" />;
          }

          return <Onboarding />;
        }}
      />
      <ProtectedRoute
        path="/garden/new"
        component={() => {
          const { user } = useAuth();
          
          if (!user?.gardenSpace) {
            return <Redirect to="/onboarding" />;
          }

          return React.lazy(() => import("./pages/garden/new"));
        }}
      />
      <ProtectedRoute
        path="/garden"
        component={() => {
          const { user } = useAuth();

          if (!user?.gardenSpace) {
            return <Redirect to="/onboarding" />;
          }

          return <Garden />;
        }}
      />
      <ProtectedRoute
        path="/garden/:id"
        component={() => {
          const { user } = useAuth();
          const [Component, setComponent] =
            React.useState<React.ComponentType | null>(null);

          React.useEffect(() => {
            import("./pages/garden/[id]").then((module) => {
              setComponent(() => module.default);
            });
          }, []);

          if (!user?.gardenSpace) {
            return <Redirect to="/onboarding" />;
          }

          if (!Component) {
            return <div>Loading...</div>;
          }

          return <Component />;
        }}
      />
      <ProtectedRoute
        path="/garden/new"
        component={() => {
          const { user } = useAuth();
          const [Component, setComponent] =
            React.useState<React.ComponentType | null>(null);

          React.useEffect(() => {
            import("./pages/garden/new").then((module) => {
              setComponent(() => module.default);
            });
          }, []);

          if (!user?.gardenSpace) {
            return <Redirect to="/onboarding" />;
          }

          if (!Component) {
            return <div>Loading...</div>;
          }

          return <Component />;
        }}
      />
      <ProtectedRoute path="/plants" component={Plants} />
      <ProtectedRoute path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function NavbarWrapper() {
  const [location] = useLocation();
  if (location === "/auth") return null;
  return <Navbar />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <NavbarWrapper />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
