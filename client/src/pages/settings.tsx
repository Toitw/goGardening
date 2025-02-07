import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { data: user } = useQuery({
    queryKey: ["/api/users/1"], // Hardcoded user ID for demo
  });

  const { toast } = useToast();
  const { logoutMutation } = useAuth();

  return (
    <div className="pb-20 md:pb-0 md:pt-16 p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Garden Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Garden Type:</span>
              <span className="ml-2">{user?.gardenSpace}</span>
            </div>
            <div>
              <span className="font-medium">Sunlight Hours:</span>
              <span className="ml-2">{user?.sunlightHours} hours</span>
            </div>
            <div>
              <span className="font-medium">Location:</span>
              <span className="ml-2">{user?.location.address}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          toast({
            title: "Coming Soon",
            description: "This feature will be available in a future update",
          });
        }}
      >
        Edit Garden Details
      </Button>

      <Button
        variant="destructive"
        className="w-full mt-4"
        onClick={() => logoutMutation.mutate()}
      >
        Logout
      </Button>
    </div>
  );
}
