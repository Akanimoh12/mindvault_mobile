import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  collectDiagnostics,
  exportDiagnosticsAsJson,
  formatDiagnosticsAsText,
  type DiagnosticsData,
} from "./diagnostics";

jest.mock("@react-native-async-storage/async-storage");
jest.mock("react-native");
jest.mock("expo-constants", () => ({
  expoConfig: {
    version: "1.0.0",
    ios: { buildNumber: "42" },
    android: { versionCode: "42" },
    extra: { deviceModel: "iPhone14" },
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockPlatform = Platform as jest.Mocked<typeof Platform>;

beforeEach(() => {
  jest.clearAllMocks();
  mockPlatform.OS = "ios";
  mockPlatform.Version = 17 as any;
});

describe("collectDiagnostics", () => {
  it("collects all diagnostic information", async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce("http://localhost:4021");
    mockAsyncStorage.getItem.mockResolvedValueOnce("test-key");

    const diagnostics = await collectDiagnostics();

    expect(diagnostics).toEqual({
      timestamp: expect.any(String),
      appVersion: "1.0.0",
      appBuildNumber: "42",
      platform: "ios",
      osVersion: "17",
      deviceModel: "iPhone14",
      environment: __DEV__ ? "development" : "production",
      apiBaseUrl: "http://localhost:4021",
      hasApiKey: true,
      logs: [],
    });
  });

  it("handles missing API key", async () => {
    mockAsyncStorage.getItem.mockResolvedValueOnce("http://localhost:4021");
    mockAsyncStorage.getItem.mockResolvedValueOnce(null);

    const diagnostics = await collectDiagnostics();

    expect(diagnostics.hasApiKey).toBe(false);
  });

  it("uses default values when AsyncStorage returns null", async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const diagnostics = await collectDiagnostics();

    expect(diagnostics.apiBaseUrl).toBe("default");
    expect(diagnostics.hasApiKey).toBe(false);
  });
});

describe("exportDiagnosticsAsJson", () => {
  it("converts diagnostics to JSON string", async () => {
    const diagnostics: DiagnosticsData = {
      timestamp: "2024-01-01T00:00:00Z",
      appVersion: "1.0.0",
      appBuildNumber: "42",
      platform: "ios",
      osVersion: "17",
      deviceModel: "iPhone14",
      environment: "production",
      apiBaseUrl: "http://localhost:4021",
      hasApiKey: true,
      logs: [],
    };

    const json = await exportDiagnosticsAsJson(diagnostics);
    const parsed = JSON.parse(json);

    expect(parsed).toEqual(diagnostics);
    expect(json).toContain('"timestamp"');
    expect(json).toContain('"appVersion"');
  });
});

describe("formatDiagnosticsAsText", () => {
  it("formats diagnostics as readable text", () => {
    const diagnostics: DiagnosticsData = {
      timestamp: "2024-01-01T00:00:00Z",
      appVersion: "1.0.0",
      appBuildNumber: "42",
      platform: "ios",
      osVersion: "17",
      deviceModel: "iPhone14",
      environment: "production",
      apiBaseUrl: "http://localhost:4021",
      hasApiKey: true,
      logs: [],
    };

    const text = formatDiagnosticsAsText(diagnostics);

    expect(text).toContain("=== MindVault Diagnostics ===");
    expect(text).toContain("App Version: 1.0.0");
    expect(text).toContain("Platform: ios");
    expect(text).toContain("Has API Key: true");
    expect(text).toContain("Please include this information when reporting issues.");
  });
});
