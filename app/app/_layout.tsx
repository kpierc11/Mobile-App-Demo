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

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "light" ? DarkTheme : DefaultTheme}>
      <UnitDataProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" options={{title:"Scan Devices"}}  />
          <Stack.Screen
            name="device/[id]"
            options={{
              headerShown: true,
              title: "Device Readings",
              headerTintColor: "#215387",
            }}
          />
        </Stack>

        <StatusBar style={colorScheme === "light" ? "light" : "dark"} />
      </UnitDataProvider>
    </ThemeProvider>
  );
}
