import { Card } from "@/components/ui/card";
import { Leaf } from "lucide-react";

interface GardenGridProps {
  gridData: any[];
  width: number;
  length: number;
  onCellClick: (x: number, y: number) => void;
}

export function GardenGrid({
  gridData,
  width,
  length,
  onCellClick,
}: GardenGridProps) {
  // Use a smaller cell size (e.g. 25cm per cell) so the grid stays compact
  const cellSize = 25;
  const columns = Math.ceil(width / cellSize);
  const rows = Math.ceil(length / cellSize);

  return (
    <div
      className="grid gap-1 p-4 w-full overflow-auto max-h-[70vh]"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(25px, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(25px, 1fr))`,
      }}
    >
      {Array.from({ length: rows * columns }).map((_, index) => {
        const x = Math.floor(index / columns);
        const y = index % columns;
        const plant = gridData[index];

        return (
          <Card
            key={index}
            className={`aspect-square flex items-center justify-center cursor-pointer hover:bg-accent ${
              plant ? "bg-primary/10" : ""
            }`}
            onClick={() => onCellClick(x, y)}
          >
            {plant && <Leaf className="h-6 w-6 text-primary" />}
          </Card>
        );
      })}
    </div>
  );
}
