import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";
import { Colors, Fonts } from "../constants/theme";

export const ThemeContext = createContext({
  colors: Colors.light,
  fonts: Fonts,
});

export const ThemeProvider = ({ children }: any) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  return (
    <ThemeContext value={{ colors, fonts: Fonts }}>{children}</ThemeContext>
  );
};

export const useTheme = () => useContext(ThemeContext);
