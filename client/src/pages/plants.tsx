import { useState } from "react";
import { plantCategories } from "@/data/plantData";
import { plantDetailsMap } from "@/data/plantDetailsData";
import { PlantCard } from "@/components/plant-card";
import { PlantDetailsDialog } from "@/components/PlantDetailsDialog";
import { AddPlantDialog } from "@/components/AddPlantDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Plants() {
  const [search, setSearch] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [showAddPlant, setShowAddPlant] = useState(false);

  // For now we ignore search filtering and show all plants.
  // The recommended plants section is a placeholder for future AI LLM integration.
  const recommendedPlants = plantCategories["Alliums"].slice(0, 2);

  return (
    <div className="relative pb-20 md:pb-0 md:pt-16">
      {/* Header with search bar */}
      <div className="p-4 sticky top-0 bg-background z-10">
        <Input
          placeholder="Search plants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Tip: Use the search bar to quickly find a plant.
        </p>
      </div>

      {/* Recommended Plants section (to be updated with AI recommendations later) */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Recommended Plants</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommendedPlants.map((plant) => {
            const details = plantDetailsMap[plant.id];
            return (
              <PlantCard
                key={plant.id}
                name={plant.name}
                image={plant.image}
                sunlight={details?.attributes?.sun_requirements || "Full Sun"}
                water={details?.attributes?.water_requirements || "Moderate"}
                description=""
                onClick={() => setSelectedPlantId(plant.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Render each category */}
      {Object.keys(plantCategories).map((category) => (
        <div key={category} className="p-4">
          <h2 className="text-xl font-bold mb-4">{category}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {plantCategories[category].map((plant) => {
              const details = plantDetailsMap[plant.id];
              return (
                <PlantCard
                  key={plant.id}
                  name={plant.name}
                  image={plant.image}
                  sunlight={details?.attributes?.sun_requirements || "Full Sun"}
                  water={details?.attributes?.water_requirements || "Moderate"}
                  description=""
                  onClick={() => setSelectedPlantId(plant.id)}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Plant Details Dialog */}
      {selectedPlantId && plantDetailsMap[selectedPlantId] && (
        <PlantDetailsDialog
          plant={plantDetailsMap[selectedPlantId]}
          onClose={() => setSelectedPlantId(null)}
        />
      )}

      <AddPlantDialog
        open={showAddPlant}
        onClose={() => setShowAddPlant(false)}
      />

      {/* Floating Add Plant Button */}
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
