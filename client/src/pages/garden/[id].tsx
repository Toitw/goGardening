const handlePlantSelect = async (plant: {
  id: string;
  name: string;
  image: string;
  category: string;
}) => {
  if (selectedCell) {
    try {
      const response = await fetch(`/api/gardens/${gardenId}/cell`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          x: selectedCell.x,
          y: selectedCell.y,
          plantData: {
            plantId: plant.id,
            image: plant.image,
            name: plant.name,
          },
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update garden cell");
      }
      // Invalidate query to refresh the grid
      await queryClient.invalidateQueries({ queryKey: ["garden", gardenId] });
      setSelectedCell(null);
    } catch (error) {
      console.error("Error updating cell:", error);
    }
  }
};
