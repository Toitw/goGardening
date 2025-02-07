import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Leaf } from "lucide-react";

interface GardenGridProps {
  gridData: any[];
  onCellClick: (x: number, y: number) => void;
}

export function GardenGrid({ gridData, onCellClick }: GardenGridProps) {
  const columns = Math.ceil(Math.sqrt(gridData.length));

  return (
    <div 
      className="grid gap-1 p-4" 
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {gridData.map((plant, index) => {
        const x = Math.floor(index / columns);
        const y = index % columns;

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