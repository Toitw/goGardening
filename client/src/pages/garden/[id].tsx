import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { GardenGrid } from "@/components/garden-grid";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function GardenDetail() {
  const params = useParams();
  const gardenId = params[0]; // wouter passes params as array indexes
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const { user } = useAuth();

  const { data: garden, isLoading, error } = useQuery({
    queryKey: ["garden", gardenId],
    queryFn: async () => {
      const numericId = parseInt(gardenId);
      if (isNaN(numericId)) {
        throw new Error('Invalid garden ID');
      }
      const response = await fetch(`/api/gardens/${numericId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch garden');
      }
      return response.json();
    },
    enabled: !!gardenId,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">Error: {(error as Error).message}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!garden) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">Garden not found</div>
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
        onCellClick={(x, y) => setSelectedCell({ x, y })}
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