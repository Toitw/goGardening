import { useQuery, useMutation } from "@tanstack/react-query";
import { GardenGrid } from "@/components/garden-grid";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";

export default function Garden() {
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const { toast } = useToast();

  const { data: garden, isLoading } = useQuery({
    queryKey: ["/api/gardens/1"], // Hardcoded user ID for demo
  });

  const updateGarden = useMutation({
    mutationFn: async (gridData: any) => {
      return apiRequest("PATCH", `/api/gardens/${garden.id}`, { gridData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gardens/1"] });
      toast({ title: "Garden updated" });
    },
  });

  const handleCellClick = (x: number, y: number) => {
    setSelectedCell({ x, y });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="pb-20 md:pb-0 md:pt-16">
      <div className="p-4">
        <h1 className="text-2xl font-bold">My Garden</h1>
      </div>
      <GardenGrid
        gridData={garden?.gridData || []}
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
