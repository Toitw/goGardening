import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { GardenGrid } from "@/components/garden-grid";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlantSelectionDialog } from "@/components/PlantSelectionDialog";

export default function GardenDetail() {
  const { id: gardenId } = useParams();
  const [selectedCell, setSelectedCell] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [pendingPlant, setPendingPlant] = useState<{
    id: string;
    name: string;
    image: string;
    category: string;
  } | null>(null);
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const {
    data: garden,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["garden", gardenId],
    queryFn: async () => {
      if (!gardenId) throw new Error("Garden ID is required");
      if (!user) throw new Error("Authentication required");
      const response = await fetch(`/api/gardens/${gardenId}`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const data = await response.json();
        if (response.status === 404) {
          throw new Error(data.error || "Garden not found");
        }
        if (response.status === 401) {
          throw new Error("Please log in to view this garden");
        }
        throw new Error(data.error || "Failed to fetch garden");
      }
      return response.json();
    },
    enabled: !!gardenId && !!user,
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">Please log in to view this garden</div>
      </div>
    );
  }
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

  // When a plant is selected in the selection dialog, set it as pending and show the confirmation dialog.
  const onPlantSelect = (plant: {
    id: string;
    name: string;
    image: string;
    category: string;
  }) => {
    setPendingPlant(plant);
    setShowAddConfirm(true);
  };

  // When the user confirms the addition, update the local cache optimistically and send the PATCH request.
  const handlePlantSelectConfirm = async () => {
    if (selectedCell && pendingPlant) {
      try {
        // Optimistic update: update the garden data in the cache
        queryClient.setQueryData(["garden", gardenId], (oldData: any) => {
          if (!oldData) return oldData;
          const updatedGrid = [...oldData.gridData];
          const cellSize = 25;
          const columns = Math.ceil(oldData.width / cellSize);
          const index = selectedCell.y * columns + selectedCell.x;
          updatedGrid[index] = {
            plantId: pendingPlant.id,
            image: pendingPlant.image,
            name: pendingPlant.name,
          };
          return { ...oldData, gridData: updatedGrid };
        });
        // Send PATCH request to update the cell in the database
        const response = await fetch(`/api/gardens/${gardenId}/cell`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            x: selectedCell.x,
            y: selectedCell.y,
            plantData: {
              plantId: pendingPlant.id,
              image: pendingPlant.image,
              name: pendingPlant.name,
            },
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to update garden cell");
        }
        // Optionally, revalidate the query
        await queryClient.invalidateQueries({ queryKey: ["garden", gardenId] });
        setSelectedCell(null);
        setPendingPlant(null);
        setShowAddConfirm(false);
      } catch (error) {
        console.error("Error updating cell:", error);
      }
    }
  };

  return (
    <div className="pb-20 md:pb-0 md:pt-16">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{garden.name}</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
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
      {/* Plant Selection Dialog (only shows if a cell is selected and no pending plant is chosen yet) */}
      <PlantSelectionDialog
        open={!!selectedCell && !pendingPlant}
        onClose={() => setSelectedCell(null)}
        onSelectPlant={onPlantSelect}
      />
      {/* Confirmation AlertDialog for adding the selected plant */}
      <AlertDialog open={showAddConfirm} onOpenChange={setShowAddConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Plant Addition</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingPlant
                ? `Add ${pendingPlant.name} to the selected cell?`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowAddConfirm(false);
                setPendingPlant(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary hover:bg-primary/90"
              onClick={handlePlantSelectConfirm}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Delete Garden Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              garden and its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                const response = await fetch(`/api/gardens/${gardenId}`, {
                  method: "DELETE",
                  credentials: "include",
                });
                if (response.ok) {
                  await queryClient.invalidateQueries({
                    queryKey: ["/api/gardens"],
                  });
                  await queryClient.invalidateQueries({
                    queryKey: ["garden", gardenId],
                  });
                  setLocation("/garden");
                }
              }}
            >
              Delete Garden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
