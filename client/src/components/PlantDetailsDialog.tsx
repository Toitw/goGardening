import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, HeartOff, ArrowLeft } from "lucide-react";

interface PlantDetailsDialogProps {
  plant: any; // Use your PlantDetails type if desired.
  image?: string;
  onClose: () => void;
}

export function PlantDetailsDialog({
  plant,
  image,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto" hideCloseButton>
        <DialogHeader>
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute top-0 left-0 p-2 hover:text-primary"
              aria-label="Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setFavorite(!favorite)}
              className="absolute top-0 right-0 p-2"
            >
              {favorite ? (
                <Heart className="text-red-500 w-6 h-6" />
              ) : (
                <HeartOff className="w-6 h-6" />
              )}
            </button>
            <div className="flex flex-col md:flex-row items-center justify-between pt-8">
              {(image || plant.image) && (
                <div className="mb-4 w-full md:w-1/2">
                  {/* Fixed-height container for the header image */}
                  <div className="h-48 w-full overflow-hidden rounded-lg">
                    <img
                      src={image || plant.image}
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
          </div>
        </DialogHeader>

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
              <div className="font-semibold truncate">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
