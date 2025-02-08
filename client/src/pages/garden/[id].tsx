import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { GardenGrid } from "@/components/garden-grid";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function GardenDetail() {
  const { id: gardenId } = useParams();
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: garden, isLoading, error } = useQuery({
    queryKey: ["garden", gardenId],
    queryFn: async () => {
      if (!gardenId) throw new Error("Garden ID is required");
      if (!user) throw new Error("Authentication required");

      console.log('Garden fetch attempt:', {
        gardenId,
        userId: user.id,
        isAuthenticated: !!user
      });

      try {

      const response = await fetch(`/api/gardens/${gardenId}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 404) {
          throw new Error(data.error || 'Garden not found');
        }
        if (response.status === 401) {
          throw new Error('Please log in to view this garden');
        }
        throw new Error(data.error || 'Failed to fetch garden');
      }

      const data = await response.json();
        console.log('Garden data received:', data);
        return data;
      } catch (error) {
        console.error('Garden fetch error:', error);
        throw error;
      }
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
      <Dialog open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Plant</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Button 
          variant="ghost" 
          size="icon"
          className="text-destructive hover:bg-destructive/10"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="w-5 h-5" />
        </Button>

        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your garden and its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={async () => {
                  const response = await fetch(`/api/gardens/${gardenId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                  });
                  if (response.ok) {
                    await queryClient.invalidateQueries({ queryKey: ["/api/gardens"] });
                    await queryClient.invalidateQueries({ queryKey: ["garden", gardenId] });
                    setLocation('/garden');
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