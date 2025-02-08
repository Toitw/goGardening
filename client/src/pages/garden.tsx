import { useQuery, useMutation } from "@tanstack/react-query";
import { GardenGrid } from "@/components/garden-grid";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";

const createGardenSchema = z.object({
  name: z.string().min(1, "Garden name is required"),
  width: z.number().min(30, "Minimum width is 30cm").max(500, "Maximum width is 500cm"),
  length: z.number().min(30, "Minimum length is 30cm").max(500, "Maximum length is 500cm"),
});

type CreateGardenData = z.infer<typeof createGardenSchema>;

export default function Garden() {
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<CreateGardenData>({
    resolver: zodResolver(createGardenSchema),
    defaultValues: {
      name: "",
      width: 100,
      length: 100,
    },
  });

  const { data: garden, isLoading } = useQuery({
    queryKey: ["/api/gardens", user?.id],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/gardens/${user?.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch garden');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching garden:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  const createGarden = useMutation({
    mutationFn: async (data: CreateGardenData) => {
      const columns = Math.ceil(data.width / 30);
      const rows = Math.ceil(data.length / 30);

      const response = await apiRequest("POST", "/api/gardens", {
        name: data.name,
        userId: user!.id,
        width: data.width,
        length: data.length,
        gridData: Array(rows * columns).fill(null),
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gardens", user?.id] });
      setShowCreateDialog(false);
      toast({ title: "Garden created successfully" });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create garden",
        variant: "destructive",
      });
    },
  });

  const handleCellClick = (x: number, y: number) => {
    setSelectedCell({ x, y });
  };

  const onSubmit = (data: CreateGardenData) => {
    createGarden.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!garden) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <h1 className="text-2xl font-bold">Welcome to Your Garden</h1>
        <p className="text-muted-foreground text-center max-w-md">
          You haven't created a garden yet. Start by creating one to begin planning your urban garden.
        </p>
        <Button onClick={() => setShowCreateDialog(true)}>Create Garden</Button>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Your Garden</DialogTitle>
              <DialogDescription>
                Set up your garden space. Measurements are in centimeters.
              </DialogDescription>
            </DialogHeader>
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
                      <FormLabel>Width (cm)</FormLabel>
                      <FormControl>
                        <Slider
                          min={30}
                          max={500}
                          step={30}
                          value={[field.value]}
                          onValueChange={([value]) => field.onChange(value)}
                          className="py-4"
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground text-right">{field.value} cm</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Length (cm)</FormLabel>
                      <FormControl>
                        <Slider
                          min={30}
                          max={500}
                          step={30}
                          value={[field.value]}
                          onValueChange={([value]) => field.onChange(value)}
                          className="py-4"
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground text-right">{field.value} cm</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createGarden.isPending}>
                  {createGarden.isPending ? "Creating..." : "Create Garden"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0 md:pt-16">
      <div className="p-4">
        <h1 className="text-2xl font-bold">{garden.name}</h1>
        <p className="text-sm text-muted-foreground">
          {garden.width}cm × {garden.length}cm
        </p>
      </div>
      <GardenGrid
        gridData={garden.gridData || []}
        width={garden.width}
        length={garden.length}
        onCellClick={handleCellClick}
      />
      <Dialog open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Plant</DialogTitle>
          </DialogHeader>
          {/* Plant selection UI would go here */}
        </DialogContent>
      </Dialog>
    </div>
  );
}