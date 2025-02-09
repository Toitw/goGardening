import { useState, useEffect } from "react";
import { plantCategories } from "@/data/plantData";
import { plantDetailsMap } from "@/data/plantDetailsData";
import { PlantCard } from "@/components/plant-card";
import { PlantDetailsDialog } from "@/components/PlantDetailsDialog";
import { AddPlantDialog } from "@/components/AddPlantDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 12;

export default function Plants() {
  const [search, setSearch] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Get all plants from all categories
  const allPlants = Object.values(plantCategories).flat();

  // Filter plants based on search
  const filteredPlants = allPlants.filter((plant) =>
    plant.name.toLowerCase().includes(search.toLowerCase()) ||
    plantDetailsMap[plant.id]?.scientific_name.toLowerCase().includes(search.toLowerCase()) ||
    plant.category.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredPlants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedPlants = filteredPlants.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="relative pb-20 md:pb-0 md:pt-16">
      {/* Header with search bar */}
      <div className="p-4 sticky top-0 bg-background z-10 border-b">
        <Input
          placeholder="Search plants by name, scientific name, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-2xl mx-auto"
        />
        <div className="flex justify-between items-center mt-2 max-w-2xl mx-auto text-sm text-muted-foreground">
          <p>Showing {displayedPlants.length} of {filteredPlants.length} plants</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Plants Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedPlants.map((plant) => {
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

        {filteredPlants.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              No plants found matching your search criteria.
            </p>
          </div>
        )}
      </div>

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
        variant="default"
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