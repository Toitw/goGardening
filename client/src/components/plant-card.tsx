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

export function PlantCard({ name, image, sunlight, water, description, onClick }: PlantCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
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
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </CardContent>
    </Card>
  );
}
