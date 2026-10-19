import React from "react";
import { render, RenderOptions } from "@testing-library/react-native";
import { ThemeProvider } from "../theme/ThemeProvider";

const mockSafeAreaInset = { top: 0, bottom: 0, left: 0, right: 0 };
const mockSafeAreaFrame = { x: 0, y: 0, width: 390, height: 844 };

export function setupFetchMock(): jest.Mock {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => [],
    text: async () => "[]",
    headers: {
      get: jest.fn((key) => {
        if (key === "content-type") return "application/json";
        return null;
      }),
    },
  });

  global.fetch = fetchMock as unknown as typeof global.fetch;
  return fetchMock;
}

export function setupSafeAreaMock(): void {
  jest.mock("react-native-safe-area-context", () => ({
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaInsetsContext: {
      Consumer: ({ children }: { children: (value: typeof mockSafeAreaInset) => React.ReactNode }) =>
        children(mockSafeAreaInset),
    },
    useSafeAreaInsets: () => mockSafeAreaInset,
    useSafeAreaFrame: () => mockSafeAreaFrame,
  }));
}

export interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  initialTheme?: "light" | "dark";
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderWithProvidersOptions
): ReturnType<typeof render> {
  const { initialTheme = "light", ...renderOptions } = options ?? {};

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export function mockAsyncStorage(): void {
  const store: Record<string, string> = {};

  jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn((key: string) => Promise.resolve(store[key] ?? null)),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
      return Promise.resolve();
    }),
    multiGet: jest.fn((keys: string[]) =>
      Promise.resolve(keys.map((key) => [key, store[key] ?? null]))
    ),
    multiSet: jest.fn((pairs: Array<[string, string]>) => {
      pairs.forEach(([key, value]) => {
        store[key] = value;
      });
      return Promise.resolve();
    }),
  }));
}

export function setupExpoConstants(): void {
  jest.mock("expo-constants", () => ({
    expoConfig: {
      version: "1.0.0",
      ios: { buildNumber: "1" },
      android: { versionCode: "1" },
      extra: { apiUrl: "http://localhost:4021", deviceModel: "iPhone" },
    },
  }));
}

export function setupFakeTimers(): void {
  jest.useFakeTimers();
}

export function teardownFakeTimers(): void {
  jest.useRealTimers();
}

export function setupNavigationMock(): void {
  jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
      pop: jest.fn(),
    }),
  }));
}
