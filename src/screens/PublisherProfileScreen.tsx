import { useState, useEffect, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/ThemeProvider";
import { getPublisherProfile, type PublisherProfile } from "../api/publishers";
import { spacing, type ThemeColors } from "../theme";

interface PublisherProfileScreenProps {
  onClose: () => void;
}

export function PublisherProfileScreen({ onClose }: PublisherProfileScreenProps) {
  const { colors, shared, typography } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [profile, setProfile] = useState<PublisherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublisherProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load publisher profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={shared.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={typography.title}>Publisher Profile</Text>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            <Pressable
              onPress={loadProfile}
              style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : profile ? (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.profileField}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Publisher Name</Text>
              <Text style={[styles.fieldValue, { color: colors.text }]}>{profile.name}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.profileField}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Email</Text>
              <Text style={[styles.fieldValue, { color: colors.text }]}>{profile.email}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.profileField}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Publisher ID</Text>
              <Text style={[styles.fieldValue, { color: colors.text, fontFamily: "monospace" }]}>
                {profile.id}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.profileField}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Created</Text>
              <Text style={[styles.fieldValue, { color: colors.text }]}>
                {new Date(profile.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ) : null}

        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.closeButton,
            { backgroundColor: colors.neutralBg },
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={[styles.closeButtonText, { color: colors.text }]}>Close</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: spacing.lg,
      gap: spacing.lg,
    },
    header: {
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    centerContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: spacing.xl,
      gap: spacing.md,
    },
    card: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    profileField: {
      padding: spacing.md,
      gap: spacing.xs,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "500",
    },
    fieldValue: {
      fontSize: 15,
      fontWeight: "500",
    },
    divider: {
      height: 1,
    },
    errorText: {
      fontSize: 16,
      textAlign: "center",
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 8,
    },
    retryButtonText: {
      color: colors.onPrimary,
      fontWeight: "600",
      fontSize: 14,
    },
    closeButton: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: 12,
      alignItems: "center",
      marginTop: spacing.lg,
    },
    closeButtonText: {
      fontWeight: "600",
      fontSize: 16,
    },
    buttonPressed: {
      opacity: 0.7,
    },
  });
}
