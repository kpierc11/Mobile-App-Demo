import { DrawerToggleButton } from "@react-navigation/drawer";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";

export default function SettingsLayout() {
  const theme = useTheme();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Settings", headerLeft: () => <DrawerToggleButton tintColor={theme.colors.primary}/>,}}
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