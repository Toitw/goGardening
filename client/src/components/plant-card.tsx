import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Droplets } from "lucide-react";

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
  const [openfarmImage, setOpenfarmImage] = useState<string>("");

  useEffect(() => {
    // Fetch the plant image from OpenFarm API using the plant name.
    fetch(`https://openfarm.cc/api/v1/crops?filter=${encodeURIComponent(name)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data?.data && data.data.length > 0) {
          const crop = data.data[0];
          const imageUrl = crop.attributes?.main_image_path;
          if (imageUrl) {
            setOpenfarmImage(imageUrl);
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching image from OpenFarm API", err);
      });
  }, [name]);

  // Determine the final image to display:
  // 1. Use the image fetched from OpenFarm if available.
  // 2. Else use the image passed as a prop.
  // 3. Else use a fallback placeholder.
  const finalImage = openfarmImage || image || "/images/placeholder.png";

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      {finalImage && (
        <img
          src={finalImage}
          alt={name}
          className="h-32 w-full object-cover rounded-t-md"
        />
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
