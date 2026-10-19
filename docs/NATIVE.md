# Native Project Generation

The `android/` and `ios/` directories are generated at build time from `app.json`, EAS configuration, and `expo-updates` settings. They are **not committed** to version control.

## Why Continuous Native Generation?

- **Single source of truth**: Configuration lives in `app.json`, `eas.json`, and environment-specific EAS profiles, not in multiple places
- **No drift**: The generated native projects always match the configuration, preventing version mismatches
- **Cleaner diffs**: Pull requests don't include generated build artifacts
- **Smaller repository**: No need to track 43+ generated files, including keystores and build artifacts

## Building Locally

When you need to build for iOS or Android, the native projects are generated automatically:

```bash
# For iOS development
eas build --platform ios --local

# For Android development
eas build --platform android --local

# For Expo Go (fastest for development)
npx expo start
```

## Configuration

All native project settings are configured through:

1. **`app.json`** — App metadata, name, version, plugins
2. **`eas.json`** — Build profiles, app signing, distribution
3. **Expo Plugins** — Individual package configurations (e.g., `expo-build-properties`, `@react-native-community/cli-platform-android`)

## Modifying Native Code

If you need to add native code or modify native configuration:

1. Edit `app.json` or use Expo plugins to configure the native layer
2. Rebuild locally with `eas build --local`
3. Test in the simulator or on a device

If a plugin doesn't support what you need, consider:

- Opening an issue with the Expo team or the plugin maintainer
- Using a custom Expo config plugin
- Ejecting from Expo (not recommended for this project)

## Reference

- [Expo documentation on prebuild](https://docs.expo.dev/workflow/prebuild/)
- [EAS Build documentation](https://docs.expo.dev/build/introduction/)
- [Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation/)
