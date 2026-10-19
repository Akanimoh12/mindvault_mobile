import { getApiBaseUrl } from "./resources";
import { getApiKey } from "../services/secureStorage";
import { extractApiErrorMessage } from "../utils/errorLogger";

/** Shape returned by `GET /publishers/me`. */
export interface PublisherProfile {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  createdAt: string;
}

/**
 * Fetches the publisher that owns an API key. Uses the stored key by default;
 * pass `apiKey` to check a new key against the server before storing it.
 */
export async function fetchMe(apiKey?: string): Promise<PublisherProfile> {
  const key = apiKey ?? (await getApiKey());
  if (!key) {
    throw new Error("No API key configured");
  }

  const res = await fetch(`${getApiBaseUrl()}/publishers/me`, {
    headers: { "x-api-key": key },
  });

  if (res.status === 401) {
    throw new Error("Unauthorized: Invalid API key");
  }
  if (!res.ok) {
    const message = await extractApiErrorMessage(res, "Failed to load publisher profile");
    // Never let a server that echoes the key leak it into the UI.
    throw new Error(message.split(key).join("[redacted]"));
  }

  return res.json();
}
