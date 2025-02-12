
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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col w-full">
            <img
              src={plant.attributes?.image || plant.image}
              alt={plant.common_name}
              className="w-full h-48 object-cover rounded-lg mb-4"
              onError={(e) => {
                e.currentTarget.src = "/images/placeholder.png";
              }}
            />
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">
                {plant.common_name}
              </DialogTitle>
              <button onClick={() => setFavorite(!favorite)}>
                {favorite ? (
                  <Heart className="text-red-500 w-6 h-6" />
                ) : (
                  <HeartOff className="w-6 h-6" />
                )}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {plant.scientific_name}
            </p>
          </div>
        </DialogHeader>

        {plant.additional_images && plant.additional_images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 my-4">
            {plant.additional_images.map((img: string, idx: number) => (
              <img
                key={idx}
                src={img}
                alt={`${plant.common_name} ${idx + 1}`}
                className="object-cover rounded-md"
              />
            ))}
          </div>
        )}

        <div className="my-4">
          <p>{plant.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-4">
          {quickInfoItems.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center cursor-pointer"
              onClick={() => console.log(`More info about ${item.label}`)}
            >
              <div className="text-2xl">{item.icon}</div>
              <div className="font-semibold">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
