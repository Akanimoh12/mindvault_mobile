import Constants from "expo-constants";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface DiagnosticsData {
  timestamp: string;
  appVersion: string;
  appBuildNumber: string;
  platform: string;
  osVersion: string;
  deviceModel: string;
  environment: string;
  apiBaseUrl: string;
  hasApiKey: boolean;
  logs: string[];
}

export async function collectDiagnostics(): Promise<DiagnosticsData> {
  const apiBaseUrl = await AsyncStorage.getItem("mindvault_api_base_url");
  const hasApiKey = await AsyncStorage.getItem("mindvault_secure_api_key");

  const diagnostics: DiagnosticsData = {
    timestamp: new Date().toISOString(),
    appVersion: Constants.expoConfig?.version ?? "unknown",
    appBuildNumber: Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode ?? "unknown",
    platform: Platform.OS,
    osVersion: Platform.Version.toString(),
    deviceModel: Constants.expoConfig?.extra?.deviceModel ?? "unknown",
    environment: __DEV__ ? "development" : "production",
    apiBaseUrl: apiBaseUrl || "default",
    hasApiKey: !!hasApiKey,
    logs: [],
  };

  return diagnostics;
}

export async function exportDiagnosticsAsJson(diagnostics: DiagnosticsData): Promise<string> {
  return JSON.stringify(diagnostics, null, 2);
}

export function formatDiagnosticsAsText(diagnostics: DiagnosticsData): string {
  const lines = [
    "=== MindVault Diagnostics ===",
    `Timestamp: ${diagnostics.timestamp}`,
    `App Version: ${diagnostics.appVersion}`,
    `Build Number: ${diagnostics.appBuildNumber}`,
    `Platform: ${diagnostics.platform}`,
    `OS Version: ${diagnostics.osVersion}`,
    `Device Model: ${diagnostics.deviceModel}`,
    `Environment: ${diagnostics.environment}`,
    `API Base URL: ${diagnostics.apiBaseUrl}`,
    `Has API Key: ${diagnostics.hasApiKey}`,
    "",
    "Please include this information when reporting issues.",
  ];

  return lines.join("\n");
}
