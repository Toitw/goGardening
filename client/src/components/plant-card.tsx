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
  // Pass the computed final image to onClick
  onClick?: (finalImage: string) => void;
}

export function PlantCard({
  name,
  image,
  sunlight,
  water,
  onClick,
}: PlantCardProps) {
  const [plantImage, setPlantImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchPlantImage() {
      try {
        setIsLoading(true);
        setError(null);
        const openFarmImage = await getOpenFarmImageFor(name);
        if (mounted) {
          setPlantImage(openFarmImage);
        }
      } catch (error) {
        console.warn(`Failed to fetch image for ${name}:`, error);
        if (mounted) {
          setError(
            error instanceof Error ? error.message : "Failed to load image",
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPlantImage();

    return () => {
      mounted = false;
    };
  }, [name]);

  // Determine the final image to display:
  // 1. Use the image from OpenFarm cache if available
  // 2. Else use the image passed as a prop
  // 3. Else use a fallback placeholder
  const finalImage = plantImage || image || "/images/placeholder.png";

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => {
        if (onClick) {
          onClick(finalImage);
        }
      }}
    >
      <div className="relative h-32">
        <img
          src={finalImage}
          alt={name}
          className={`h-32 w-full object-cover rounded-t-md ${
            isLoading ? "opacity-0" : "opacity-100"
          } transition-opacity duration-200`}
          onError={(e) => {
            e.currentTarget.src = "/images/placeholder.png";
          }}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse rounded-t-md" />
        )}
      </div>
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
