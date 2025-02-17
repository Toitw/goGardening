// client/src/pages/garden/[id].tsx
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
  const [showCellActionDialog, setShowCellActionDialog] = useState(false);
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

  // Helper: Define a set of colors and generate a unique color per plant based on its id.
  const plantColors = [
    "#34d399",
    "#f87171",
    "#60a5fa",
    "#fbbf24",
    "#a78bfa",
    "#f472b6",
    "#34ace0",
  ];
  function getPlantColor(plantId: string): string {
    const index = parseInt(plantId) % plantColors.length;
    return plantColors[index];
  }

  // Handler for cell click.
  // If the cell contains a plant, open the cell action dialog.
  // Otherwise, let the PlantSelectionDialog open.
  const handleCellClick = (x: number, y: number) => {
    setSelectedCell({ x, y });
    const cellSize = 25;
    const columns = Math.ceil(garden.width / cellSize);
    const index = x * columns + y;
    const cell = garden.gridData[index];
    if (cell && (cell.name || cell.image)) {
      setShowCellActionDialog(true);
    } else {
      setShowCellActionDialog(false);
    }
  };

  // When a plant is selected in the dialog, store it as pending and show the confirmation dialog.
  const onPlantSelect = (plant: {
    id: string;
    name: string;
    image: string;
    category: string;
  }) => {
    setPendingPlant(plant);
    setShowAddConfirm(true);
  };

  // Confirmation handler for adding/changing a plant in a cell.
  const handlePlantSelectConfirm = async () => {
    if (selectedCell && pendingPlant) {
      try {
        const color = getPlantColor(pendingPlant.id);
        queryClient.setQueryData(["garden", gardenId], (oldData: any) => {
          if (!oldData) return oldData;
          const updatedGrid = [...oldData.gridData];
          const cellSize = 25;
          const columns = Math.ceil(oldData.width / cellSize);
          const index = selectedCell.x * columns + selectedCell.y;
          updatedGrid[index] = {
            plantId: pendingPlant.id,
            name: pendingPlant.name,
            color,
          };
          return { ...oldData, gridData: updatedGrid };
        });
        const response = await fetch(`/api/gardens/${gardenId}/cell`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            x: selectedCell.x,
            y: selectedCell.y,
            plantData: {
              plantId: pendingPlant.id,
              name: pendingPlant.name,
              color,
            },
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to update garden cell");
        }
        await queryClient.invalidateQueries({ queryKey: ["garden", gardenId] });
        setSelectedCell(null);
        setPendingPlant(null);
        setShowAddConfirm(false);
      } catch (error) {
        console.error("Error updating cell:", error);
      }
    }
  };

  // Handler for deleting a plant from a cell.
  const handleDeletePlant = async () => {
    if (selectedCell) {
      // Store the current cell and clear selection immediately
      const cellToDelete = selectedCell;
      setSelectedCell(null);
      setShowCellActionDialog(false);
      try {
        const response = await fetch(`/api/gardens/${gardenId}/cell`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            x: cellToDelete.x,
            y: cellToDelete.y,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to delete plant from cell");
        }
        queryClient.setQueryData(["garden", gardenId], (oldData: any) => {
          if (!oldData) return oldData;
          const updatedGrid = [...oldData.gridData];
          const cellSize = 25;
          const columns = Math.ceil(oldData.width / cellSize);
          const index = cellToDelete.x * columns + cellToDelete.y;
          updatedGrid[index] = null;
          return { ...oldData, gridData: updatedGrid };
        });
        await queryClient.invalidateQueries({ queryKey: ["garden", gardenId] });
      } catch (error) {
        console.error("Error deleting plant from cell:", error);
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
        onCellClick={handleCellClick}
      />
      {/* Plant Selection Dialog for empty cells or for changing a plant */}
      <PlantSelectionDialog
        open={!!selectedCell && !pendingPlant && !showCellActionDialog}
        onClose={() => setSelectedCell(null)}
        onSelectPlant={onPlantSelect}
      />
      {/* Confirmation dialog for adding/changing the selected plant */}
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
      {/* Cell Action Dialog for cells that already contain a plant */}
      <AlertDialog
        open={showCellActionDialog}
        onOpenChange={setShowCellActionDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cell Action</AlertDialogTitle>
            <AlertDialogDescription>
              What would you like to do with this cell?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <Button
              onClick={() => {
                // Change plant: close this dialog to reveal the PlantSelectionDialog.
                setShowCellActionDialog(false);
              }}
            >
              Change Plant
            </Button>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeletePlant}
            >
              Delete Plant
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => {
                setShowCellActionDialog(false);
                setSelectedCell(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Delete garden confirmation dialog */}
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
