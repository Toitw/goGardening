
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createGardenSchema = z.object({
  name: z.string().min(1, "Garden name is required"),
  width: z.number().min(30, "Minimum width is 30cm").max(1000, "Maximum width is 1000cm"),
  length: z.number().min(30, "Minimum length is 30cm").max(1000, "Maximum length is 1000cm"),
});

export function CreateGardenForm() {
  const [, setLocation] = useLocation();
  const form = useForm({
    resolver: zodResolver(createGardenSchema),
    defaultValues: {
      name: "",
      width: 60,
      length: 60,
    },
  });

  const onSubmit = async (data: z.infer<typeof createGardenSchema>) => {
    try {
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

      const garden = await response.json();
      setLocation(`/garden/${garden.id}`);
    } catch (error) {
      console.error("Failed to create garden:", error);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Create New Garden</CardTitle>
        <CardDescription>
          Set up your garden space dimensions and give it a name
        </CardDescription>
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
                      step={30}
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
                      step={30}
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">Create Garden</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
