import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Leaf } from "lucide-react";

interface GardenGridProps {
  gridData: any[];
  onCellClick: (x: number, y: number) => void;
}

export function GardenGrid({ gridData, onCellClick }: GardenGridProps) {
  return (
    <div className="grid grid-cols-6 gap-1 p-4">
      {Array.from({ length: 36 }).map((_, index) => {
        const x = Math.floor(index / 6);
        const y = index % 6;
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
