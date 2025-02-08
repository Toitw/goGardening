import { useParams, Link } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Sprout } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

export default function Garden() {
  const { user } = useAuth();

  const { data: gardens } = useQuery({
    queryKey: ["/api/gardens"],
    queryFn: async () => {
      const response = await fetch("/api/gardens");
      if (!response.ok) {
        throw new Error("Failed to fetch gardens");
      }
      return response.json();
    },
    enabled: !!user?.id,
  });

  if (!gardens) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (gardens.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Sprout className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>Welcome to Your Garden Journey</CardTitle>
            <CardDescription className="mt-2">
              Start your gardening adventure by creating your first garden space. 
              Plan, grow, and nurture your plants in a personalized environment.
            </CardDescription>
            <Link href="/garden/new">
              <Button className="w-full mt-6">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Garden
              </Button>
            </Link>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Gardens</h1>
        <Link href="/garden/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Garden
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gardens.map((garden) => (
          <Link key={garden.id} href={`/garden/${garden.id}`}>
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <CardTitle>{garden.name}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}