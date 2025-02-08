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
import { useParams, Link } from "wouter";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";


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
  const params = useParams();
  const gardenId = params[0];


  const form = useForm<CreateGardenData>({
    resolver: zodResolver(createGardenSchema),
    defaultValues: {
      name: "",
      width: 100,
      length: 100,
    },
  });

  const { data: garden, isLoading } = useQuery({
    queryKey: ["/api/gardens", gardenId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/gardens/${gardenId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch garden');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching garden:', error);
        throw error;
      }
    },
    enabled: !!gardenId && !!user?.id,
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

  if (isLoading && gardenId) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!garden && gardenId) {
    return <p>Garden not found</p>;
  }

  if (!gardenId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
      <p>Select a garden</p>
      </div>
    )
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


import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function GardenList() {
  const { user } = useAuth();

  const { data: gardens, isLoading } = useQuery({
    queryKey: ["/api/gardens"],
    queryFn: async () => {
      const response = await fetch("/api/gardens");
      if (!response.ok) {
        throw new Error('Failed to fetch gardens');
      }
      return response.json();
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gardens?.map((garden: any) => (
          <Card key={garden.id} className="hover:bg-accent/50 transition-colors">
            <Link href={`/garden/${garden.id}`}>
              <CardHeader className="cursor-pointer">
                <CardTitle>{garden.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {garden.width}cm × {garden.length}cm
                </p>
              </CardHeader>
            </Link>
          </Card>
        ))}
        <Card className="hover:bg-accent/50 transition-colors">
          <Link href="/garden/new">
            <CardHeader className="cursor-pointer h-full flex items-center justify-center">
              <Button variant="ghost" className="w-full h-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Garden
              </Button>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  );
}