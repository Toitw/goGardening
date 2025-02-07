import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { PlantCard } from "@/components/plant-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { searchPlants, getPlantDetails } from "@/lib/api";

export default function Plants() {
  const [search, setSearch] = useState("");
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);

  const { data: plants, isLoading } = useQuery({
    queryKey: ["plants", search],
    queryFn: () => searchPlants(search),
    enabled: search.length > 2,
  });

  const { data: plantDetails } = useQuery({
    queryKey: ["plant", selectedPlant],
    queryFn: () => getPlantDetails(selectedPlant!),
    enabled: !!selectedPlant,
  });

  return (
    <div className="pb-20 md:pb-0 md:pt-16">
      <div className="p-4 sticky top-0 bg-background z-10">
        <Input
          placeholder="Search plants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          plants?.data.map((plant: any) => (
            <PlantCard
              key={plant.id}
              name={plant.attributes.name}
              image={plant.attributes.main_image_path}
              sunlight={plant.attributes.sun_requirements}
              water={plant.attributes.water_requirements}
              description={plant.attributes.description}
              onClick={() => setSelectedPlant(plant.id)}
            />
          ))
        )}
      </div>

      <Dialog open={!!selectedPlant} onOpenChange={() => setSelectedPlant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {plantDetails?.data.attributes.name}
            </DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm">
            <p>{plantDetails?.data.attributes.description}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
