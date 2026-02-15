import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Image, Text } from "react-native";
import UnitDataProvider from "@/components/UnitDataProvider";
import { Drawer } from 'expo-router/drawer';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "light" ? DarkTheme : DefaultTheme}>
      <UnitDataProvider>
        <Stack
          screenOptions={{
            headerTintColor: "#215387",
            headerTitleAlign: "left",
            headerTitle: "MyQuattro™",
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: true,
              title: "Devices",
              contentStyle: {
                paddingTop: 0,
              },
            }}
          />
        </Stack>

        <StatusBar style={colorScheme === "light" ? "light" : "dark"} />
      </UnitDataProvider>
    </ThemeProvider>
  );
}
