import Fuse from "fuse.js";

// Define a more specific type for the OpenFarm data
interface OpenFarmCrop {
  type: string;
  id: string;
  attributes: {
    name: string;
    slug: string;
    main_image_path: string;
    description: string;
  };
}

// Cache for the loaded crop data
let cropDataCache: OpenFarmCrop[] = [];

// Create a function to load the JSON data with type checking
async function loadCropData(): Promise<OpenFarmCrop[]> {
  if (cropDataCache.length > 0) {
    return cropDataCache;
  }

  try {
    console.log("Attempting to load OpenFarm crop data...");
    const response = await fetch("/data/openfarmCrops.json");
    if (!response.ok) {
      throw new Error(
        `Failed to load crop data: ${response.status} ${response.statusText}`,
      );
    }
    const data = await response.json();
    console.log(
      `Successfully loaded ${Array.isArray(data) ? data.length : 0} crops`,
    );
    cropDataCache = Array.isArray(data) ? data : [];
    return cropDataCache;
  } catch (error) {
    console.error("Failed to load OpenFarm crop data:", error);
    return [];
  }
}

const fuseOptions = {
  keys: [
    { name: "attributes.common_names", weight: 0.9 },
    { name: "attributes.name", weight: 0.1 },
  ],
  threshold: 0.6,
  includeScore: true,
};

// Initialize Fuse with the loaded data
let fuseInstance: Fuse<OpenFarmCrop> | null = null;

async function getFuseInstance(): Promise<Fuse<OpenFarmCrop>> {
  if (!fuseInstance) {
    const crops = await loadCropData();
    fuseInstance = new Fuse(crops, fuseOptions);
  }
  return fuseInstance;
}

export async function getOpenFarmImageFor(
  plantName: string,
): Promise<string | null> {
  if (!plantName) return null;

  try {
    console.log(`Looking up image for plant: ${plantName}`);
    // Try exact match first
    const crops = await loadCropData();
    const exactMatch = crops.find(
      (crop) => crop.attributes.common_names?.some(name => name.toLowerCase() === plantName.toLowerCase()),
    );
    if (exactMatch?.attributes.main_image_path) {
      console.log(`Found exact match for ${plantName}`);
      return exactMatch.attributes.main_image_path;
    }

    // Try fuzzy match if exact match fails
    const fuse = await getFuseInstance();
    const results = fuse.search(plantName);
    if (results.length > 0) {
      console.log("Fuzzy match results:");
      results.forEach((result, idx) => {
        console.log(
          `${idx}: ${result.item.attributes.name} - score: ${result.score}`,
        );
      });
      // Accept best match if its score is below our threshold (0.6)
      if (results[0].score !== undefined && results[0].score < 0.6) {
        const bestMatch = results[0].item;
        console.log(
          `Found fuzzy match for ${plantName}: ${bestMatch.attributes.name} (score: ${results[0].score})`,
        );
        return bestMatch.attributes.main_image_path || null;
      }
    }

    console.log(`No match found for ${plantName}`);
    return null;
  } catch (error) {
    console.error("Error finding plant image:", error);
    return null;
  }
}
