import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GardenGrid } from "@/components/garden-grid";
import { PlantSelectionDialog } from "@/components/PlantSelectionDialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface SelectedCell {
  x: number;
  y: number;
}

export default function GardenPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const gardenId = parseInt(params.id);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);

  const { data: garden, isLoading } = useQuery({
    queryKey: ["/api/gardens", gardenId],
    queryFn: async () => {
      const response = await fetch(`/api/gardens/${gardenId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch garden");
      }
      return response.json();
    },
    enabled: !!user?.id && !!gardenId,
  });

  const handleCellClick = (x: number, y: number) => {
    setSelectedCell({ x, y });
  };

  const handlePlantSelect = async (plant: {
    id: string;
    name: string;
    image: string;
    category: string;
  }) => {
    if (selectedCell) {
      try {
        // Calculate the index in the gridData array
        const index = selectedCell.x * Math.ceil(garden.width / 25) + selectedCell.y;

        // Create a new gridData array with the updated cell
        const newGridData = [...garden.gridData];
        newGridData[index] = {
          plantId: plant.id,
          image: plant.image,
          name: plant.name,
        };

        // Update the garden with the new grid data
        const response = await fetch(`/api/gardens/${gardenId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            gridData: newGridData,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update garden");
        }

        // Invalidate query to refresh the grid
        await queryClient.invalidateQueries({ queryKey: ["/api/gardens", gardenId] });
        setSelectedCell(null);

        toast({
          title: "Plant added",
          description: `${plant.name} has been added to your garden`,
        });
      } catch (error) {
        console.error("Error updating garden:", error);
        toast({
          title: "Error",
          description: "Failed to add plant to garden",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading || !garden) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading garden...</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-8">{garden.name}</h1>
      <GardenGrid
        gridData={garden.gridData}
        width={garden.width}
        length={garden.length}
        onCellClick={handleCellClick}
      />
      <PlantSelectionDialog
        open={!!selectedCell}
        onClose={() => setSelectedCell(null)}
        onSelectPlant={handlePlantSelect}
      />
    </div>
  );
}