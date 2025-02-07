
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const settingsSchema = insertUserSchema.omit({ username: true, password: true }).extend({
  sunlightHours: insertUserSchema.shape.sunlightHours
    .int("Must be a whole number")
    .min(0, "Must be at least 0 hours")
    .max(24, "Cannot exceed 24 hours"),
});

export default function Settings() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(settingsSchema),
    values: {
      location: user?.location || { lat: 0, lng: 0, address: "" },
      gardenSpace: user?.gardenSpace || "",
      sunlightHours: user?.sunlightHours || 0,
    },
  });

  const requestLocation = async () => {
    if ("geolocation" in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await response.json();
          
          const city = data.address?.city || 
                      data.address?.town || 
                      data.address?.village || 
                      'Unknown location';
          
          form.setValue("location", {
            lat,
            lng,
            address: city,
          });
          form.trigger("location");
        } catch (error) {
          form.setValue("location", {
            lat,
            lng,
            address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          });
          form.trigger("location");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to get location",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await apiRequest("POST", "/api/users/onboarding", {
        ...data,
        sunlightHours: Number(data.sunlightHours),
      });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-8 md:py-16">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Button type="button" onClick={requestLocation} variant="outline" className="w-full">
                  Detect Location
                </Button>
                <div className="mt-2">
                  {form.getValues("location.address") ? (
                    <p className="text-sm text-muted-foreground text-center">
                      📍 {form.getValues("location.address")}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">No location detected</p>
                  )}
                </div>
              </div>
              <FormField
                control={form.control}
                name="gardenSpace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Garden Space</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select garden type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="container">Container Garden</SelectItem>
                        <SelectItem value="raised">Raised Bed</SelectItem>
                        <SelectItem value="ground">In-Ground Garden</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sunlightHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Sunlight Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        step="1"
                        {...field}
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        onChange={(e) => {
                          const value = e.target.value.replace(/^0+/, '');
                          const num = Math.min(24, Math.max(0, Number(value) || 0));
                          field.onChange(num);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          </Form>
          <hr />
          <Button variant="destructive" onClick={() => logoutMutation.mutate()} className="w-full">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
