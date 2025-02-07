import { Link, useLocation } from "wouter";
import { Leaf, Grid, Settings } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t h-16 px-4 flex items-center justify-around md:top-0 md:h-16 md:border-b md:border-t-0">
      <Link href="/garden">
        <a className={`flex flex-col items-center ${location === "/garden" ? "text-primary" : "text-muted-foreground"}`}>
          <Grid className="h-6 w-6" />
          <span className="text-xs">Garden</span>
        </a>
      </Link>
      <Link href="/plants">
        <a className={`flex flex-col items-center ${location === "/plants" ? "text-primary" : "text-muted-foreground"}`}>
          <Leaf className="h-6 w-6" />
          <span className="text-xs">Plants</span>
        </a>
      </Link>
      <Link href="/settings">
        <a className={`flex flex-col items-center ${location === "/settings" ? "text-primary" : "text-muted-foreground"}`}>
          <Settings className="h-6 w-6" />
          <span className="text-xs">Settings</span>
        </a>
      </Link>
    </nav>
  );
}
