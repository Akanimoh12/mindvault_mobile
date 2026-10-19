import { getPublisherProfile, setPublisherApiBaseUrl } from "./publishers";
import { getApiKey } from "../services/secureStorage";

jest.mock("../services/secureStorage");

const mockGetApiKey = getApiKey as jest.MockedFunction<typeof getApiKey>;

const originalFetch = global.fetch;

beforeEach(() => {
  jest.clearAllMocks();
  setPublisherApiBaseUrl("http://localhost:4021");
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe("getPublisherProfile", () => {
  it("fetches the publisher profile with the API key", async () => {
    const mockProfile = {
      id: "pub-123",
      name: "Test Publisher",
      email: "test@example.com",
      createdAt: "2024-01-01T00:00:00Z",
    };

    mockGetApiKey.mockResolvedValue("test-api-key");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockProfile,
    });

    const result = await getPublisherProfile();

    expect(result).toEqual(mockProfile);
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:4021/publishers/me", {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "test-api-key",
      },
    });
  });

  it("fetches without API key if not set", async () => {
    const mockProfile = {
      id: "pub-123",
      name: "Test Publisher",
      email: "test@example.com",
      createdAt: "2024-01-01T00:00:00Z",
    };

    mockGetApiKey.mockResolvedValue(null);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockProfile,
    });

    await getPublisherProfile();

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:4021/publishers/me", {
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  it("throws an error when the response is not ok", async () => {
    mockGetApiKey.mockResolvedValue("test-api-key");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: "Unauthorized",
    });

    await expect(getPublisherProfile()).rejects.toThrow(
      "Failed to fetch publisher profile: Unauthorized"
    );
  });
});
