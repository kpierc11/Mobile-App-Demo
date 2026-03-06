import { createContext } from "react";

export type ThemeMode = "light" | "dark";

type ThemeContextType = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  setMode: () => {},
});
