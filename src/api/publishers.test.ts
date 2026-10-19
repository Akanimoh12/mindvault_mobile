import { fetchMe } from "./publishers";
import { getApiBaseUrl } from "./resources";
import { getApiKey } from "../services/secureStorage";

jest.mock("../services/secureStorage", () => ({
  getApiKey: jest.fn(),
}));

const mockGetApiKey = getApiKey as jest.MockedFunction<typeof getApiKey>;
const originalFetch = global.fetch;

const profile = {
  id: "pub-123",
  name: "Test Publisher",
  email: "test@example.com",
  walletAddress: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
  createdAt: "2024-01-01T00:00:00Z",
};

function mockFetch(body: unknown, status = 200) {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
    headers: { get: () => "application/json" },
  });
  global.fetch = fetchMock as unknown as typeof global.fetch;
  return fetchMock;
}

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe("fetchMe", () => {
  it("requests /publishers/me on the configured API with the stored key", async () => {
    mockGetApiKey.mockResolvedValue("stored-key");
    const fetchMock = mockFetch(profile);

    await expect(fetchMe()).resolves.toEqual(profile);
    expect(fetchMock).toHaveBeenCalledWith(`${getApiBaseUrl()}/publishers/me`, {
      headers: { "x-api-key": "stored-key" },
    });
  });

  it("uses an explicit key instead of the stored one, for validating a new key", async () => {
    mockGetApiKey.mockResolvedValue("stored-key");
    const fetchMock = mockFetch(profile);

    await fetchMe("candidate-key");
    expect(fetchMock.mock.calls[0][1]).toEqual({ headers: { "x-api-key": "candidate-key" } });
  });

  it("throws without calling the API when no key is stored", async () => {
    mockGetApiKey.mockResolvedValue(null);
    const fetchMock = mockFetch(profile);

    await expect(fetchMe()).rejects.toThrow("No API key configured");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps 401 to a friendly message", async () => {
    mockFetch({ error: "Invalid API key" }, 401);
    await expect(fetchMe("bad-key")).rejects.toThrow("Unauthorized: Invalid API key");
  });

  it("surfaces the server message for other errors, without echoing the key", async () => {
    mockFetch({ error: "Publisher disabled for key-123" }, 403);
    await expect(fetchMe("key-123")).rejects.toThrow("Publisher disabled for [redacted]");
  });
});
