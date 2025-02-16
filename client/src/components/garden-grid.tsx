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
  const cellSize = 25; // Smaller cell size
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
        const cell = gridData[index];
        return (
          <Card
            key={index}
            className="aspect-square relative cursor-pointer hover:bg-accent"
            onClick={() => onCellClick(x, y)}
          >
            {cell && cell.image ? (
              <img
                src={cell.image}
                alt={cell.name || "Plant"}
                className="w-full h-full object-cover rounded"
              />
            ) : cell ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
