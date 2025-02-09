import Fuse from 'fuse.js';
import crops from '../data/openfarmCrops.json';

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

const fuseOptions = {
  keys: ['attributes.name'],
  threshold: 0.3, // Lower threshold means more strict matching
  includeScore: true,
};

const fuse = new Fuse(crops as OpenFarmCrop[], fuseOptions);

export function getOpenFarmImageFor(plantName: string): string | null {
  if (!plantName) return null;

  // Try exact match first
  const exactMatch = crops.find(
    (crop) => crop.attributes.name.toLowerCase() === plantName.toLowerCase()
  );
  if (exactMatch?.attributes.main_image_path) {
    return exactMatch.attributes.main_image_path;
  }

  // Try fuzzy match
  const results = fuse.search(plantName);
  if (results.length > 0 && results[0].score && results[0].score < 0.4) {
    const bestMatch = results[0].item;
    return bestMatch.attributes.main_image_path || null;
  }

  return null;
}
