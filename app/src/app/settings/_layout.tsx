import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Settings"}}
      />
      <Stack.Screen
        name="appearance"
        options={{ title: "Appearance" }}
      />
      <Stack.Screen
        name="language"
        options={{ title: "Language" }}
      />
    </Stack>
  );
}