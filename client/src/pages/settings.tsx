import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="container py-8 md:py-16">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p>{user?.email}</p>
          </div>
          <Button variant="destructive" onClick={() => logoutMutation.mutate()}>
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}