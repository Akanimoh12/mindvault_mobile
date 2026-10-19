import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import { PublisherProfileScreen } from "./PublisherProfileScreen";
import { getPublisherProfile } from "../api/publishers";
import { ThemeProvider } from "../theme/ThemeProvider";

jest.mock("../api/publishers");
jest.mock("react-native-safe-area-context", () => {
  const inset = { top: 0, bottom: 0, left: 0, right: 0 };
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => inset,
  };
});

const mockGetPublisherProfile = getPublisherProfile as jest.MockedFunction<
  typeof getPublisherProfile
>;

describe("PublisherProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays the publisher profile when loaded", async () => {
    const mockProfile = {
      id: "pub-123",
      name: "Test Publisher",
      email: "test@example.com",
      createdAt: "2024-01-01T00:00:00Z",
    };

    mockGetPublisherProfile.mockResolvedValue(mockProfile);

    const { getByText } = render(
      <ThemeProvider>
        <PublisherProfileScreen onClose={jest.fn()} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText("Test Publisher")).toBeTruthy();
      expect(getByText("test@example.com")).toBeTruthy();
      expect(getByText("pub-123")).toBeTruthy();
    });
  });

  it("displays an error when profile fetch fails", async () => {
    mockGetPublisherProfile.mockRejectedValue(new Error("Unauthorized"));

    const { getByText } = render(
      <ThemeProvider>
        <PublisherProfileScreen onClose={jest.fn()} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText("Unauthorized")).toBeTruthy();
    });
  });

  it("retries loading the profile when retry button is pressed", async () => {
    mockGetPublisherProfile.mockRejectedValueOnce(new Error("Network error"));

    const mockProfile = {
      id: "pub-123",
      name: "Test Publisher",
      email: "test@example.com",
      createdAt: "2024-01-01T00:00:00Z",
    };

    mockGetPublisherProfile.mockResolvedValueOnce(mockProfile);

    const { getByText, queryByText } = render(
      <ThemeProvider>
        <PublisherProfileScreen onClose={jest.fn()} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText("Network error")).toBeTruthy();
    });

    const retryButton = getByText("Retry");
    fireEvent.press(retryButton);

    await waitFor(() => {
      expect(queryByText("Network error")).toBeNull();
      expect(getByText("Test Publisher")).toBeTruthy();
    });
  });

  it("calls onClose when close button is pressed", async () => {
    const mockProfile = {
      id: "pub-123",
      name: "Test Publisher",
      email: "test@example.com",
      createdAt: "2024-01-01T00:00:00Z",
    };

    mockGetPublisherProfile.mockResolvedValue(mockProfile);
    const onClose = jest.fn();

    const { getByText } = render(
      <ThemeProvider>
        <PublisherProfileScreen onClose={onClose} />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText("Test Publisher")).toBeTruthy();
    });

    const closeButton = getByText("Close");
    fireEvent.press(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
