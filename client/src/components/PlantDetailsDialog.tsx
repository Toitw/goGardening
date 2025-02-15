import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, HeartOff } from "lucide-react";

interface PlantDetailsDialogProps {
  plant: any; // Use your PlantDetails type if desired.
  onClose: () => void;
}

export function PlantDetailsDialog({
  plant,
  onClose,
}: PlantDetailsDialogProps) {
  const [favorite, setFavorite] = useState(false);

  // Quick info items (icons with minimal text)
  const quickInfoItems = [
    { label: "Spacing", value: plant.attributes.spacing, icon: "📏" },
    { label: "Depth", value: plant.attributes.planting_depth, icon: "🔻" },
    { label: "Sun", value: plant.attributes.sun_requirements, icon: "☀️" },
    { label: "Water", value: plant.attributes.water_requirements, icon: "💧" },
    { label: "Season", value: plant.attributes.season, icon: "📅" },
    { label: "Frost", value: plant.attributes.frost_tolerance, icon: "❄️" },
    { label: "Height", value: plant.attributes.height, icon: "📏" },
    { label: "Germ.", value: plant.attributes.germination, icon: "🌱" },
    { label: "Harvest", value: plant.attributes.sprout_to_harvest, icon: "⏱️" },
    { label: "pH", value: plant.attributes.soil_ph, icon: "🧪" },
  ];

  return (
    <Dialog open={!!plant} onOpenChange={onClose}>
      {/* Make the dialog scrollable */}
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="relative">
            <div className="flex flex-col md:flex-row items-center justify-between">
              {(plant.image) && (
                <div className="mb-4 w-full md:w-1/2">
                  {/* Fixed-height container for the header image */}
                  <div className="h-48 w-full overflow-hidden rounded-lg">
                    <img
                      src={plant.image}
                      alt={plant.common_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div className="w-full md:w-1/2 text-center md:text-left">
                <DialogTitle className="text-2xl font-bold truncate">
                  {plant.common_name}
                </DialogTitle>
                <p className="text-sm text-muted-foreground truncate">
                  {plant.scientific_name}
                </p>
              </div>
            </div>
            {/* Favorite button always at top-right */}
            <button
              onClick={() => setFavorite(!favorite)}
              className="absolute top-2 right-2"
            >
              {favorite ? (
                <Heart className="text-red-500 w-6 h-6" />
              ) : (
                <HeartOff className="w-6 h-6" />
              )}
            </button>
          </div>
        </DialogHeader>

        {plant.additional_images && plant.additional_images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 my-4">
            {plant.additional_images.map((img: string, idx: number) => (
              <img
                key={idx}
                src={img}
                alt={`${plant.common_name} ${idx + 1}`}
                className="object-cover rounded-md h-32 w-full"
              />
            ))}
          </div>
        )}

        <div className="my-4">
          <p>{plant.description}</p>
        </div>


