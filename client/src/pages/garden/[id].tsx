import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GardenGrid } from "@/components/garden-grid";
import { PlantSelectionDialog } from "@/components/PlantSelectionDialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";

interface SelectedCell {
  x: number;
  y: number;
}

interface GardenPageProps {
  params: {
    id: string;
  };
}

export default function GardenPage({ params }: GardenPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const gardenId = parseInt(params.id);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [localGridData, setLocalGridData] = useState<any[]>([]);

  // Redirect if garden ID is invalid
  if (isNaN(gardenId)) {
    return <Redirect to="/garden" />;
  }

  const { data: garden, isLoading } = useQuery({
    queryKey: ["/api/gardens", gardenId],
    queryFn: async () => {
      const response = await fetch(`/api/gardens/${gardenId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Garden not found");
        }
        throw new Error("Failed to fetch garden");
      }
      const data = await response.json();
      // Ensure gridData is properly initialized and update local state
      if (!Array.isArray(data.gridData)) {
        data.gridData = [];
      }
      setLocalGridData(data.gridData);
      return data;
    },
    enabled: !!user?.id && !isNaN(gardenId),
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
    if (!selectedCell || !garden) return;

    try {
      const columns = Math.ceil(garden.width / 25);
      const index = selectedCell.x * columns + selectedCell.y;

      // Create a new gridData array with proper length if needed
      const newGridData = Array.isArray(localGridData)
        ? [...localGridData]
        : new Array(Math.ceil(garden.width / 25) * Math.ceil(garden.length / 25)).fill(null);

      // Update the selected cell
      newGridData[index] = {
        plantId: plant.id,
        image: plant.image,
        name: plant.name,
      };

      // Update local state immediately
      setLocalGridData(newGridData);

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

      // Close the dialog
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
        gridData={localGridData}
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