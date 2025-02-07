
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { logout } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <Link href="/garden">
            <Button variant="ghost">Garden</Button>
          </Link>
          <Link href="/plants">
            <Button variant="ghost">Plants</Button>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <Button variant="ghost">Settings</Button>
          </Link>
          <Button variant="ghost" onClick={logout}>Logout</Button>
        </div>
      </div>
    </nav>
  );
}
