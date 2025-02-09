import fs from 'fs';
import path from 'path';

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

async function fetchOpenFarmData(startPage = 1) {
  const crops: OpenFarmCrop[] = [];
  let page = startPage;
  const perPage = 25;
  let hasMoreData = true;
  const dataDir = path.join(process.cwd(), 'client', 'src', 'data');
  const tempFile = path.join(dataDir, 'openfarmCrops.temp.json');
  const finalFile = path.join(dataDir, 'openfarmCrops.json');
  let retryCount = 0;
  const maxRetries = 3;

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

  console.log('Starting to fetch OpenFarm data...');
  console.log(`Current progress: ${crops.length} crops`);

  while (hasMoreData) {
    try {
      console.log(`Fetching page ${page}...`);
      const response = await fetch(
        `https://openfarm.cc/api/v1/crops?per_page=${perPage}&page=${page}`
      );

      if (!response.ok) {
        if (response.status === 429) {
          console.log('Rate limited, waiting longer...');
          await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second wait
          continue;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OpenFarmResponse = await response.json();

      if (!data.data || data.data.length === 0) {
        console.log('No more data available, completing fetch.');
        hasMoreData = false;
        break;
      }

      crops.push(...data.data);
      console.log(`Retrieved ${data.data.length} crops from page ${page}. Total: ${crops.length}`);

      // Save progress every 10 pages
      if (page % 10 === 0) {
        fs.writeFileSync(tempFile, JSON.stringify(crops, null, 2));
        console.log(`Progress saved at page ${page} (${crops.length} crops)`);
      }

      page++;
      retryCount = 0; // Reset retry count on successful request

      // Increased delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Error fetching data:', error);
      retryCount++;

      if (retryCount >= maxRetries) {
        // Save progress before exiting on error
        fs.writeFileSync(tempFile, JSON.stringify(crops, null, 2));
        console.log(`Progress saved after ${maxRetries} failed attempts. You can resume by running the script again.`);
        console.log(`Last successful page: ${page - 1}`);
        process.exit(1);
      }

      console.log(`Retry attempt ${retryCount}/${maxRetries}. Waiting before retry...`);
      await new Promise(resolve => setTimeout(resolve, 5000 * retryCount)); // Increasing backoff
      continue;
    }
  }

  console.log(`Total crops fetched: ${crops.length}`);

  // Write the final data and remove temp file
  fs.writeFileSync(finalFile, JSON.stringify(crops, null, 2));
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }
  console.log(`Data written to ${finalFile}`);
}

fetchOpenFarmData().catch(console.error);