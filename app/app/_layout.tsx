import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import UnitDataProvider from "@/components/UnitDataProvider";
import {createAsyncStorage} from "@react-native-async-storage/async-storage"

export const storage = createAsyncStorage("myQuattroDB");

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <UnitDataProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(drawer)" options={{ title: "Scan Devices" }} />
        <Stack.Screen
          name="device/[id]"
          options={{
            headerShown: true,
            title: "Device Readings",
            headerTintColor: "#215387",
          }}
        />
        <Stack.Screen
          name="settings/appearance"
          options={{
            headerShown: true,
            title: "Appearance",
            headerTintColor: "#215387",
          }}
        />
        <Stack.Screen
          name="settings/language"
          options={{
            headerShown: true,
            title: "Language",
            headerTintColor: "#215387",
          }}
        />

        <Stack.Screen
          name="about/supported-devices"
          options={{
            headerShown: true,
            title: "Supported Devices",
            headerTintColor: "#215387",
          }}
        />
        <Stack.Screen
          name="device/edit-alias"
          options={{
            headerShown: true,
            title: "Edit Device Name",
            headerTintColor: "#215387",
          }}
        />
      </Stack>

      <StatusBar style={colorScheme === "light" ? "light" : "dark"} />
    </UnitDataProvider>
  );
}
