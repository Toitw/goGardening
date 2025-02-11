import Fuse from "fuse.js";
import pluralize from "pluralize";

// Define a more specific type for the OpenFarm data
interface OpenFarmCrop {
  type: string;
  id: string;
  attributes: {
    name: string | null;
    slug: string | null;
    common_names?: (string | null)[];
    main_image_path?: string | null;
    description?: string | null;
  };
}

// Cache for the loaded crop data
let cropDataCache: OpenFarmCrop[] = [];

// Base URL to prefix relative image paths
const BASE_IMAGE_URL = "https://openfarm.cc";

// Cache for approved (non-fallback) images keyed by normalized plant name
const approvedImageCache = new Map<string, string>();

// Function to load the JSON data with type checking
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

// Normalize names by trimming, lowercasing, and converting to singular.
// If input is null or not a string, return an empty string.
function normalizeName(name: string | null): string {
  if (!name || typeof name !== "string") return "";
  return pluralize.singular(name.trim().toLowerCase());
}

// Check if a given image URL is considered a fallback.
function isFallbackImage(image: string | null): boolean {
  if (!image) return true;
  // In our case, a fallback image starts with the known fallback prefix.
  return image.startsWith("/assets/baren_field_square-");
}

// Fuse options: search common_names, name, and slug.
const fuseOptions = {
  keys: [
    { name: "attributes.common_names", weight: 0.5 },
    { name: "attributes.name", weight: 0.3 },
    { name: "attributes.slug", weight: 0.2 },
  ],
  threshold: 0.5, // Allow some tolerance in matching
  includeScore: true,
};

let fuseInstance: Fuse<OpenFarmCrop> | null = null;
async function getFuseInstance(): Promise<Fuse<OpenFarmCrop>> {
  if (!fuseInstance) {
    const crops = await loadCropData();
    fuseInstance = new Fuse(crops, fuseOptions);
  }
  return fuseInstance;
}

// If the returned image URL is relative, prefix it with the base URL.
function prefixImageUrl(url: string): string {
  if (url.startsWith("http")) {
    return url;
  }
  if (url.startsWith("/")) {
    return BASE_IMAGE_URL + url;
  }
  return url;
}

export async function getOpenFarmImageFor(
  plantName: string,
): Promise<string | null> {
  if (!plantName) return null;
  try {
    console.log(`Looking up image for plant: ${plantName}`);
    const normalizedInput = normalizeName(plantName);

    // If we already have an approved image in cache, return it.
    if (approvedImageCache.has(normalizedInput)) {
      console.log(`Cache hit for ${plantName}`);
      return approvedImageCache.get(normalizedInput)!;
    }

    const crops = await loadCropData();

    // First, try an exact match on normalized common_names, name, or slug
    const matchingCrops = crops.filter((crop) => {
      const normName = normalizeName(crop.attributes.name);
      const normSlug = normalizeName(crop.attributes.slug);
      const commonMatch = crop.attributes.common_names?.some(
        (common) => normalizeName(common) === normalizedInput,
      );
      return (
        normName === normalizedInput ||
        normSlug === normalizedInput ||
        !!commonMatch
      );
    });

    if (matchingCrops.length > 0) {
      // Look for a record with a non-fallback image.
      const approved = matchingCrops.find(
        (crop) =>
          crop.attributes.main_image_path &&
          !isFallbackImage(crop.attributes.main_image_path),
      );
      if (approved && approved.attributes.main_image_path) {
        const finalImage = prefixImageUrl(approved.attributes.main_image_path);
        console.log(
          `Found approved exact match for ${plantName}: ${approved.attributes.name}`,
        );
        approvedImageCache.set(normalizedInput, finalImage);
        return finalImage;
      }
      // If none found, fall back to the first exact match (even if it is a fallback)
      const fallbackCandidate = matchingCrops[0];
      if (fallbackCandidate && fallbackCandidate.attributes.main_image_path) {
        console.log(
          `Only fallback image found for ${plantName}: ${fallbackCandidate.attributes.name}`,
        );
        approvedImageCache.set(
          normalizedInput,
          prefixImageUrl(fallbackCandidate.attributes.main_image_path),
        );
        return prefixImageUrl(fallbackCandidate.attributes.main_image_path);
      }
    }

    // If no exact match (or no approved exact match), perform fuzzy matching using Fuse.js
    const fuse = await getFuseInstance();
    const results = fuse.search(plantName);
    if (results.length > 0) {
      console.log("Fuzzy match results:");
      results.forEach((result, idx) => {
        console.log(
          `${idx}: ${result.item.attributes.name} - score: ${result.score}`,
        );
      });
      if (results[0].score !== undefined && results[0].score < 0.6) {
        const bestMatch = results[0].item;
        if (bestMatch.attributes.main_image_path) {
          // If the best match has a fallback image, try to find another similar one among fuzzy results.
          if (isFallbackImage(bestMatch.attributes.main_image_path)) {
            console.log(
              `Best fuzzy match for ${plantName} is a fallback image, searching for alternative...`,
            );
            const alternative = results.find(
              (result) =>
                result.item.attributes.main_image_path &&
                !isFallbackImage(result.item.attributes.main_image_path),
            );
            if (alternative && alternative.item.attributes.main_image_path) {
              const finalAlt = prefixImageUrl(
                alternative.item.attributes.main_image_path,
              );
              console.log(
                `Found approved fuzzy match for ${plantName}: ${alternative.item.attributes.name} (score: ${alternative.score})`,
              );
              approvedImageCache.set(normalizedInput, finalAlt);
              return finalAlt;
            }
          } else {
            const finalImage = prefixImageUrl(
              bestMatch.attributes.main_image_path,
            );
            console.log(
              `Found fuzzy match for ${plantName}: ${bestMatch.attributes.name} (score: ${results[0].score})`,
            );
            approvedImageCache.set(normalizedInput, finalImage);
            return finalImage;
          }
        }
      }
    }
    console.log(`No match found for ${plantName}`);
    return null;
  } catch (error) {
    console.error("Error finding plant image:", error);
    return null;
  }
}
