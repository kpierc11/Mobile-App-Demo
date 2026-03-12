import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import UnitDataProvider from "../components/UnitDataProvider";
import { ThemeProvider } from "@react-navigation/native";
import { HbsTheme, HbsDarkTheme } from "../constants/theme";
import { useEffect, useState } from "react";
import { SettingsStore } from "../hooks/useStorage";
import { ThemeContext, ThemeMode } from "../components/ThemeContext";
import PacketQueueProvider from "../components/PacketQueue";

export default function RootLayout() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const theme = mode === "dark" ? HbsDarkTheme : HbsTheme;

  const getCurrentThemeMode = async () => {
    try {
      const colorMode = await SettingsStore.getValueFor("themeColorMode");

      if (colorMode === "light" || colorMode === "dark") {
        setMode(colorMode);
      }
    } catch (error) {
      console;
    }
  };

  useEffect(() => {
    getCurrentThemeMode();
  }, []);

  return (
    <ThemeContext value={{ mode, setMode }}>
      <ThemeProvider value={theme}>
        <PacketQueueProvider>
          <UnitDataProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                headerTintColor: theme.colors.primary,
              }}
            >
              <Stack.Screen name="(drawer)" />
            </Stack>
            <StatusBar style={mode === "dark" ? "light" : "dark"} />
          </UnitDataProvider>
        </PacketQueueProvider>
      </ThemeProvider>
    </ThemeContext>
  );
}
