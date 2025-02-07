import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Garden from "@/pages/garden";
import Plants from "@/pages/plants";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/onboarding" />} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/garden" component={Garden} />
      <Route path="/plants" component={Plants} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Navbar />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
