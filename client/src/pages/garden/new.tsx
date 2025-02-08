
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const gardenSchema = z.object({
  name: z.string().min(1, "Garden name is required"),
  width: z.number().min(30, "Minimum width is 30cm").max(1000, "Maximum width is 1000cm"),
  length: z.number().min(30, "Minimum length is 30cm").max(1000, "Maximum length is 1000cm"),
});

type GardenForm = z.infer<typeof gardenSchema>;

export default function NewGarden() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const form = useForm<GardenForm>({
    resolver: zodResolver(gardenSchema),
    defaultValues: {
      name: "",
      width: 120,
      length: 120,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: GardenForm) => {
      const response = await fetch("/api/gardens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create garden");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gardens"] });
      setLocation("/garden");
    },
  });

  const onSubmit = (data: GardenForm) => {
    mutation.mutate(data);
  };

  return (
    <div className="container py-8 md:py-16">
      <Card>
        <CardHeader>
          <CardTitle>Create New Garden</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Garden Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Garden" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (cm): {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={30}
                        max={1000}
                        step={10}
                        value={[field.value]}
                        onValueChange={([value]) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (cm): {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={30}
                        max={1000}
                        step={10}
                        value={[field.value]}
                        onValueChange={([value]) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating..." : "Create Garden"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
