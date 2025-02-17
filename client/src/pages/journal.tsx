import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Journal() {
  const { user } = useAuth();

  return (
    <div className="container py-8 md:py-16">
      <Card>
        <CardHeader>
          <CardTitle>Garden Journal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Your garden journal entries will appear here. Track your garden's progress, make notes about plant growth, and record important events.
            </p>
            {/* Journal entries will be added here in the next iteration */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
