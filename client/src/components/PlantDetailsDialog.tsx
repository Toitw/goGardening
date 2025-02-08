import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, HeartOff } from "lucide-react";

interface PlantDetailsDialogProps {
  plant: any; // Ideally type this with your API response structure
  onClose: () => void;
}

export function PlantDetailsDialog({ plant, onClose }: PlantDetailsDialogProps) {
  const [favorite, setFavorite] = useState(false);

  // Create an array for quick info items.
  const quickInfoItems = [
    { label: "Spacing", value: plant.attributes.spacing, icon: "📏" },
    { label: "Planting Depth", value: plant.attributes.planting_depth, icon: "🔻" },
    { label: "Sun", value: plant.attributes.sun_requirements, icon: "☀️" },
    { label: "Water", value: plant.attributes.water_requirements, icon: "💧" },
    { label: "Season", value: plant.attributes.season, icon: "📅" },
    { label: "Frost", value: plant.attributes.frost_tolerance, icon: "❄️" },
    { label: "Height", value: plant.attributes.height, icon: "📏" },
    { label: "Germination", value: plant.attributes.germination, icon: "🌱" },
    { label: "Sprout to Harvest", value: plant.attributes.sprout_to_harvest, icon: "⏱️" },
    { label: "Soil pH", value: plant.attributes.soil_ph, icon: "🧪" },
  ];

  return (
    <Dialog open={!!plant} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {plant.attributes.name}
            </DialogTitle>
            <button onClick={() => setFavorite(!favorite)}>
              {favorite ? (
                <Heart className="text-red-500 w-6 h-6" />
              ) : (
                <HeartOff className="w-6 h-6" />
              )}
            </button>
          </div>
          {plant.attributes.binomial_name && (
            <p className="text-sm text-muted-foreground">
              {plant.attributes.binomial_name}
            </p>
          )}
        </DialogHeader>

        {/* Additional images grid */}
        {plant.attributes.additional_images &&
          plant.attributes.additional_images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 my-4">
              {plant.attributes.additional_images.map((img: string, index: number) => (
                <img
                  key={index}
                  src={img}
                  alt={`${plant.attributes.name} ${index + 1}`}
                  className="object-cover rounded-md"
                />
              ))}
            </div>
          )}

        {/* Description */}
        <div className="my-4">
          <p>{plant.attributes.description}</p>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-4">
          {quickInfoItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center cursor-pointer"
              onClick={() => {
                // When clicking an item, you might open a dialog with extra info.
                // For now, we simply log the label.
                console.log(`Show more info about ${item.label}`);
              }}
            >
              <div className="text-2xl">{item.icon}</div>
              <div className="font-semibold">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Additional Categories */}
        <div className="space-y-4 my-4">
          {plant.attributes.varieties && (
            <div>
              <h3 className="font-bold">Varieties</h3>
              <p>{(plant.attributes.varieties as string[]).join(", ")}</p>
            </div>
          )}
          {plant.attributes.companion_plants && (
            <div>
              <h3 className="font-bold">Companion Plants</h3>
              <p>{(plant.attributes.companion_plants as string[]).join(", ")}</p>
            </div>
          )}
          {plant.attributes.combative_plants && (
            <div>
              <h3 className="font-bold">Combative Plants</h3>
              <p>{(plant.attributes.combative_plants as string[]).join(", ")}</p>
            </div>
          )}
          {plant.attributes.nutrition && (
            <div>
              <h3 className="font-bold">Nutrition</h3>
              <p>{plant.attributes.nutrition}</p>
            </div>
          )}
          {plant.attributes.pests && (
            <div>
              <h3 className="font-bold">Pests</h3>
              <p>{plant.attributes.pests}</p>
            </div>
          )}
          {plant.attributes.diseases && (
            <div>
              <h3 className="font-bold">Diseases</h3>
              <p>{plant.attributes.diseases}</p>
            </div>
          )}
          {plant.attributes.beneficial_critters && (
            <div>
              <h3 className="font-bold">Beneficial Critters</h3>
              <p>{plant.attributes.beneficial_critters}</p>
            </div>
          )}
          <div>
            <h3 className="font-bold">Growing from Seed</h3>
            <p>{plant.attributes.growing_from_seed}</p>
          </div>
          <div>
            <h3 className="font-bold">Planting Considerations</h3>
            <p>{plant.attributes.planting_considerations}</p>
          </div>
          <div>
            <h3 className="font-bold">Feeding</h3>
            <p>{plant.attributes.feeding}</p>
          </div>
          <div>
            <h3 className="font-bold">Harvest</h3>
            <p>{plant.attributes.harvest}</p>
          </div>
          <div>
            <h3 className="font-bold">Storage</h3>
            <p>{plant.attributes.storage}</p>
          </div>
          <div>
            <h3 className="font-bold">Pruning</h3>
            <p>{plant.attributes.pruning}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
