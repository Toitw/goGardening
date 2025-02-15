import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { plantCategories } from "@/data/plantData";
import { PlantCard } from "@/components/plant-card";

interface PlantSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectPlant: (plant: {
    id: string;
    name: string;
    image: string;
    category: string;
  }) => void;
}

export function PlantSelectionDialog({
  open,
  onClose,
  onSelectPlant,
}: PlantSelectionDialogProps) {
  const allPlants = Object.values(plantCategories).flat();
  const [search, setSearch] = useState("");

  const filteredPlants = allPlants.filter((plant) =>
    plant.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-sm max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a Plant</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <input
            type="text"
            placeholder="Search plants..."
            className="w-full border p-2 mb-4 rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPlants.map((plant) => (
              <div
                key={plant.id}
                onClick={() => {
                  onSelectPlant(plant);
                  onClose();
                }}
                className="cursor-pointer"
              >
                <PlantCard
                  name={plant.name}
                  image={plant.image}
                  sunlight="Unknown"
                  water="Unknown"
                  description=""
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
