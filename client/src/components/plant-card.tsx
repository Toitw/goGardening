import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Droplets } from "lucide-react";
import { getOpenFarmImageFor } from "@/utils/fuzzyMatchOpenFarm";

interface PlantCardProps {
  name: string;
  image: string;
  sunlight: string;
  water: string;
  description: string;
  onClick?: () => void;
}

export function PlantCard({
  name,
  image,
  sunlight,
  water,
  onClick,
}: PlantCardProps) {
  const [plantImage, setPlantImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlantImage() {
      try {
        const openFarmImage = await getOpenFarmImageFor(name);
        if (openFarmImage) {
          setPlantImage(openFarmImage);
        }
      } catch (error) {
        console.warn(`Failed to fetch image for ${name}:`, error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlantImage();
  }, [name]);

  // Determine the final image to display:
  // 1. Use the image from our OpenFarm cache if available
  // 2. Else use the image passed as a prop
  // 3. Else use a fallback placeholder
  const finalImage = plantImage || image || "/images/placeholder.png";

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      {finalImage && (
        <div className="relative h-32">
          <img
            src={finalImage}
            alt={name}
            className={`h-32 w-full object-cover rounded-t-md ${
              isLoading ? "opacity-0" : "opacity-100"
            } transition-opacity duration-200`}
          />
          {isLoading && (
            <div className="absolute inset-0 bg-muted animate-pulse rounded-t-md" />
          )}
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Sun className="h-4 w-4" />
            {sunlight}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Droplets className="h-4 w-4" />
            {water}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}