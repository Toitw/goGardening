import Fuse from 'fuse.js';

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
    console.log('Attempting to load OpenFarm crop data...');
    const response = await fetch('/data/openfarmCrops.json');
    if (!response.ok) {
      throw new Error(`Failed to load crop data: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`Successfully loaded ${Array.isArray(data) ? data.length : 0} crops`);
    cropDataCache = Array.isArray(data) ? data : [];
    return cropDataCache;
  } catch (error) {
    console.error('Failed to load OpenFarm crop data:', error);
    return [];
  }
}

const fuseOptions = {
  keys: ['attributes.name'],
  threshold: 0.4, // Increased threshold for more lenient matching
  includeScore: true,
  ignoreLocation: true, // Ignore where in the string the match occurs
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

export async function getOpenFarmImageFor(plantName: string): Promise<string | null> {
  if (!plantName) return null;

  try {
    console.log(`Looking up image for plant: ${plantName}`);
    // Try exact match first (case-insensitive)
    const crops = await loadCropData();
    const exactMatch = crops.find(
      (crop) => crop.attributes.name.toLowerCase() === plantName.toLowerCase()
    );

    if (exactMatch?.attributes.main_image_path) {
      console.log(`Found exact match for ${plantName}`);
      return exactMatch.attributes.main_image_path;
    }

    // Try common name variations
    const variations = [
      plantName,
      plantName.toLowerCase(),
      plantName.toUpperCase(),
      // Add common plural/singular variations
      plantName.endsWith('s') ? plantName.slice(0, -1) : `${plantName}s`,
    ];

    for (const variation of variations) {
      const variationMatch = crops.find(
        (crop) => crop.attributes.name.toLowerCase() === variation.toLowerCase()
      );
      if (variationMatch?.attributes.main_image_path) {
        console.log(`Found variation match for ${plantName} using ${variation}`);
        return variationMatch.attributes.main_image_path;
      }
    }

    // Try fuzzy match if no exact match found
    const fuse = await getFuseInstance();
    const results = fuse.search(plantName);

    if (results.length > 0) {
      const bestMatch = results[0];
      console.log(`Found fuzzy match for ${plantName}: ${bestMatch.item.attributes.name} (score: ${bestMatch.score})`);
      return bestMatch.item.attributes.main_image_path || null;
    }

    console.log(`No match found for ${plantName}`);
    return null;
  } catch (error) {
    console.error('Error finding plant image:', error);
    return null;
  }
}