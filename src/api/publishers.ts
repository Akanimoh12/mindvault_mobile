import { getApiKey } from "../services/secureStorage";

export interface PublisherProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

let apiBaseUrl = "http://localhost:4021";

export function setPublisherApiBaseUrl(url: string): void {
  apiBaseUrl = url;
}

async function getHeaders(): Promise<Record<string, string>> {
  const apiKey = await getApiKey();
  return {
    "Content-Type": "application/json",
    ...(apiKey && { "x-api-key": apiKey }),
  };
}

export async function getPublisherProfile(): Promise<PublisherProfile> {
  const headers = await getHeaders();
  const response = await fetch(`${apiBaseUrl}/publishers/me`, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch publisher profile: ${response.statusText}`);
  }

  return response.json();
}
