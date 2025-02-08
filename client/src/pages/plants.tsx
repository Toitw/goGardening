import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { PlantCard } from "@/components/plant-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { searchPlants, getPlantDetails } from "@/lib/api";
import { PlantDetailsDialog } from "@/components/PlantDetailsDialog";
import { AddPlantDialog } from "@/components/AddPlantDialog";

export default function Plants() {
  const [search, setSearch] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [showAddPlant, setShowAddPlant] = useState(false);

  const { data: plants, isLoading } = useQuery({
    queryKey: ["plants", search],
    queryFn: () => searchPlants(search),
    enabled: search.length > 2,
  });

  const { data: plantDetails } = useQuery({
    queryKey: ["plant", selectedPlantId],
    queryFn: () => getPlantDetails(selectedPlantId!),
    enabled: !!selectedPlantId,
  });

  return (
    <div className="relative pb-20 md:pb-0 md:pt-16">
      {/* Header with search bar and insights */}
      <div className="p-4 sticky top-0 bg-background z-10">
        <Input
          placeholder="Search plants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Tip: Try keywords like "tomato", "basil" or "cucumber" to search for
          plants.
        </p>
      </div>

      {/* Plant list section */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">All Plants</h2>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {plants?.data.map((plant: any) => (
              <PlantCard
                key={plant.id}
                name={plant.attributes.name}
                image={plant.attributes.main_image_path}
                sunlight={plant.attributes.sun_requirements}
                water={plant.attributes.water_requirements}
                description={plant.attributes.description}
                onClick={() => setSelectedPlantId(plant.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Plant Details Dialog */}
      {plantDetails && selectedPlantId && (
        <PlantDetailsDialog
          plant={plantDetails.data}
          onClose={() => setSelectedPlantId(null)}
        />
      )}

      {/* Add Plant Dialog */}
      <AddPlantDialog
        open={showAddPlant}
        onClose={() => setShowAddPlant(false)}
      />

      {/* Floating "Add Plant" Button */}
      <Button
        variant="primary"
        size="lg"
        className="fixed bottom-8 right-8 rounded-full shadow-lg flex items-center gap-2"
        onClick={() => setShowAddPlant(true)}
      >
        <Plus className="w-6 h-6" />
        <span className="hidden md:inline">Add Plant</span>
      </Button>
    </div>
  );
}
