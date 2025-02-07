import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema, locationSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      location: { lat: 0, lng: 0, address: "" },
      gardenSpace: "",
      sunlightHours: 0,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await apiRequest("POST", "/api/users", data);
      setLocation("/garden");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      });
    }
  };

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("location", {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Location detected",
          });
        },
        () => {
          toast({
            title: "Error",
            description: "Failed to get location",
            variant: "destructive",
          });
        }
      );
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
              {step === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="button" onClick={() => setStep(2)} className="w-full">
                    Next
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <Button type="button" onClick={requestLocation} variant="outline" className="w-full">
                    Detect Location
                  </Button>
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
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Complete Setup
                  </Button>
                </>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
