import fs from 'fs';
import path from 'path';
import PQueue from 'p-queue';

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

interface OpenFarmResponse {
  data: OpenFarmCrop[];
}

async function fetchWithRetry(url: string, retries = 3, baseDelay = 2000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);

      // If rate limited, wait longer and retry
      if (response.status === 429) {
        const waitTime = baseDelay * Math.pow(2, i + 1); // Exponential backoff
        console.log(`Rate limited, waiting ${waitTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (response.ok) return response;
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
      const waitTime = baseDelay * Math.pow(2, i);
      console.log(`Retry attempt ${i + 1}/${retries}. Waiting ${waitTime/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw new Error('Max retries reached');
}

async function fetchPage(page: number, perPage: number): Promise<OpenFarmCrop[]> {
  const response = await fetchWithRetry(
    `https://openfarm.cc/api/v1/crops?per_page=${perPage}&page=${page}`,
    5, // More retries
    5000 // Longer base delay
  );
  const data: OpenFarmResponse = await response.json();
  return data.data || [];
}

async function fetchOpenFarmData(startPage = 1, targetPage = 300) { // Fetch in smaller chunks
  const crops: OpenFarmCrop[] = [];
  let page = startPage;
  const perPage = 25; // Reduced to minimize impact of failed requests
  let hasMoreData = true;
  const dataDir = path.join(process.cwd(), 'client', 'public', 'data');
  const tempFile = path.join(dataDir, 'openfarmCrops.temp.json');
  const finalFile = path.join(dataDir, 'openfarmCrops.json');

  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing data if available
  if (fs.existsSync(tempFile)) {
    console.log('Found existing temp file, resuming from there...');
    const existingData = JSON.parse(fs.readFileSync(tempFile, 'utf-8'));
    crops.push(...existingData);
    page = Math.floor(crops.length / perPage) + 1;
    console.log(`Resuming from page ${page} (${crops.length} crops loaded)`);
  }

  // Create a queue with reduced concurrency and increased interval
  const queue = new PQueue({ 
    concurrency: 2, // Reduced concurrency
    interval: 2000, // Increased interval between requests
    intervalCap: 1 // Only 1 request per interval
  });

  console.log('Starting to fetch OpenFarm data...');
  console.log(`Current progress: ${crops.length} crops`);
  console.log(`Target: pages ${startPage} to ${targetPage}`);

  while (hasMoreData && page <= targetPage) {
    const currentPage = page;
    try {
      const pageCrops = await queue.add(() => fetchPage(currentPage, perPage));
      if (pageCrops.length === 0) {
        hasMoreData = false;
        break;
      }
      crops.push(...pageCrops);
      console.log(`Retrieved ${pageCrops.length} crops from page ${currentPage}. Total: ${crops.length}`);

      // Save progress more frequently (every 5 pages)
      if (currentPage % 5 === 0) {
        fs.writeFileSync(tempFile, JSON.stringify(crops, null, 2));
        console.log(`Progress saved at page ${currentPage} (${crops.length} crops)`);
      }

      page++;
    } catch (error) {
      console.error(`Error fetching page ${currentPage}:`, error);
      // Save progress on error
      fs.writeFileSync(tempFile, JSON.stringify(crops, null, 2));
      console.log(`Progress saved after error at page ${currentPage}. Run again with startPage=${currentPage} to resume.`);
      process.exit(1);
    }
  }

  // Write the final data
  const outputFile = page >= targetPage ? finalFile : tempFile;
  fs.writeFileSync(outputFile, JSON.stringify(crops, null, 2));
  console.log(`Data written to ${outputFile}`);
  console.log(`Total crops fetched: ${crops.length}`);

  if (page < targetPage) {
    console.log(`\nTo continue fetching, run the script again with:`);
    console.log(`startPage=${page}, targetPage=${targetPage}`);
  }
}

// Parse command line arguments for start and target pages
const args = process.argv.slice(2);
const startPage = parseInt(args[0]) || 1;
const targetPage = parseInt(args[1]) || 300;

fetchOpenFarmData(startPage, targetPage).catch(console.error);