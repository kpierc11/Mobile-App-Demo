import { DrawerToggleButton } from "@react-navigation/drawer";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";

export default function AboutLayout() {
  const theme = useTheme();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "About",
          headerLeft: () => (
            <DrawerToggleButton tintColor={theme.colors.primary} />
          ),
        }}
      />

      <Stack.Screen
        name="supported-devices"
        options={{ title: "Supported Devices" }}
      />
    </Stack>
  );
}
