const OPENFARM_API = "https://openfarm.cc/api/v1";

// Add timeout and retry logic for API requests
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Log the error details for debugging
      console.error(`API Error: ${response.status} ${response.statusText}`);
      console.error(`URL: ${url}`);

      if (response.status === 502 && retries > 0) {
        console.log(`Retrying request to ${url}, ${retries} attempts remaining`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        return fetchWithRetry(url, options, retries - 1);
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Request timeout for ${url}`);
      if (retries > 0) {
        console.log(`Retrying request to ${url}, ${retries} attempts remaining`);
        return fetchWithRetry(url, options, retries - 1);
      }
    }
    throw error instanceof Error ? error : new Error('An unknown error occurred');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchPlants(query: string) {
  try {
    const response = await fetchWithRetry(
      `${OPENFARM_API}/crops?filter=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    return data;
  } catch (error: unknown) {
    console.error('Error searching plants:', error);
    throw new Error('Failed to fetch plants: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function getPlantDetails(id: string) {
  try {
    const response = await fetchWithRetry(`${OPENFARM_API}/crops/${id}`);
    const data = await response.json();
    return data;
  } catch (error: unknown) {
    console.error('Error fetching plant details:', error);
    throw new Error('Failed to fetch plant details: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}