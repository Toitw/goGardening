const OPENFARM_API = "https://openfarm.cc/api/v1";

export async function searchPlants(query: string) {
  const response = await fetch(
    `${OPENFARM_API}/crops?filter=${encodeURIComponent(query)}`
  );
  if (!response.ok) throw new Error("Failed to fetch plants");
  return response.json();
}

export async function getPlantDetails(id: string) {
  const response = await fetch(`${OPENFARM_API}/crops/${id}`);
  if (!response.ok) throw new Error("Failed to fetch plant details");
  return response.json();
}
