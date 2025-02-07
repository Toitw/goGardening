import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const extendedSchema = insertUserSchema.omit({ username: true, password: true }).extend({
  sunlightHours: insertUserSchema.shape.sunlightHours
    .int("Must be a whole number")
    .min(0, "Must be at least 0 hours")
    .max(24, "Cannot exceed 24 hours"),
});

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(extendedSchema),
    defaultValues: {
      location: { lat: 0, lng: 0, address: "" },
      gardenSpace: "",
      sunlightHours: 0,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await apiRequest("POST", "/api/users/onboarding", {
        ...data,
        sunlightHours: Number(data.sunlightHours),
      });
      setLocation("/garden");
    } catch (error: any) {
      const errorMessage = error.message || "Failed to complete setup";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const requestLocation = async () => {
    if ("geolocation" in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        console.log("Location detected:", { lat, lng });
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await response.json();
          console.log("Geocoding response:", data);
          
          const city = data.address?.city || 
                      data.address?.town || 
                      data.address?.village || 
                      'Unknown location';
                      
          console.log("Setting location with city:", city);
          
          form.setValue("location", {
            lat,
            lng,
            address: city,
          });
          
          // Force form update
          form.trigger("location");
        } catch (error) {
          console.error("Geocoding error:", error);
          form.setValue("location", {
            lat,
            lng,
            address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          });
          form.trigger("location");
        }
      } catch (error) {
        console.error("Location error:", error);
        toast({
          title: "Error",
          description: "Failed to get location",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-b from-primary/10 to-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Garden Setup</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                Complete Setup
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}