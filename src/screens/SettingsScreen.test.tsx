import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Share } from "react-native";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SettingsScreen } from "./SettingsScreen";
import { getDefaultApiBaseUrl } from "../api/apiSettings";
import { RootNavigator, type RootStackParamList } from "../navigation";
import { ThemeProvider } from "../theme/ThemeProvider";
import { renderWithProviders, setupFetchMock } from "../test-utils";

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock("./CatalogScreen", () => ({ CatalogScreen: () => null }));

jest.mock("react-native-safe-area-context", () => {
  const inset = { top: 0, bottom: 0, left: 0, right: 0 };
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => inset,
    SafeAreaInsetsContext: {
      Consumer: ({ children }: { children: (value: typeof inset) => React.ReactNode }) =>
        children(inset),
    },
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

const originalDev = __DEV__;

function setDev(value: boolean) {
  (globalThis as unknown as { __DEV__: boolean }).__DEV__ = value;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  setupFetchMock();
});

afterEach(() => {
  setDev(originalDev);
});

async function renderSettings() {
  const screen = renderWithProviders(<SettingsScreen />);
  await screen.findByDisplayValue(getDefaultApiBaseUrl());
  return screen;
}

async function routeNames() {
  const ref = createNavigationContainerRef<RootStackParamList>();
  render(
    <ThemeProvider>
      <NavigationContainer ref={ref}>
        <RootNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
  await waitFor(() => expect(ref.isReady()).toBe(true));
  return ref.getRootState().routeNames;
}

describe("developer tools", () => {
  it("are hidden in production builds", async () => {
    setDev(false);

    const { queryByText } = await renderSettings();
    expect(queryByText("Developer Options")).toBeNull();
    expect(await routeNames()).not.toContain("DevSigner");
  });

  it("are available in development builds", async () => {
    setDev(true);

    const { getByText } = await renderSettings();
    expect(getByText("Developer Options")).toBeTruthy();
    expect(await routeNames()).toContain("DevSigner");
  });
});

describe("diagnostics", () => {
  it("shows the report for review before sharing it", async () => {
    const share = jest.spyOn(Share, "share").mockResolvedValue({ action: Share.sharedAction });
    const screen = await renderSettings();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Share diagnostics"));
    });

    expect(screen.getByText("Review before sharing")).toBeTruthy();
    expect(screen.getByLabelText("Diagnostics report").props.children).toContain(
      "=== MindVault Diagnostics ==="
    );
    expect(share).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Share"));
    });
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("MindVault Diagnostics") })
    );
    share.mockRestore();
  });

  it("shares nothing when the preview is cancelled", async () => {
    const share = jest.spyOn(Share, "share").mockResolvedValue({ action: Share.sharedAction });
    const screen = await renderSettings();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Share diagnostics"));
    });
    fireEvent.press(screen.getByLabelText("Cancel"));

    expect(screen.queryByText("Review before sharing")).toBeNull();
    expect(share).not.toHaveBeenCalled();
    share.mockRestore();
  });
});
