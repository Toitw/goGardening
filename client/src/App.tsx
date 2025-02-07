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

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/garden" />} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/onboarding" component={Onboarding} />
      <ProtectedRoute path="/garden" component={Garden} />
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