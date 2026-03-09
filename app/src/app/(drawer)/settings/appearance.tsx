import React, { useContext, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Checkbox } from "expo-checkbox";
import { Appearance } from "react-native";
import { useTheme } from "@react-navigation/native";
import { SettingsStore } from "@/src/hooks/useStorage";
import { ThemeContext } from "@/src/components/ThemeContext";

export default function AppearanceSettings() {
  const theme = useTheme();
  const { mode, setMode } = useContext(ThemeContext);

  const saveColorModeState = async () => {
    try {
      await SettingsStore.save("themeColorMode", mode);
    } catch (error) {
    }
  };

  useEffect(() => {
    Appearance.setColorScheme(mode);
    saveColorModeState();
  }, [mode]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Appearance
      </Text>
      <View
        style={[styles.settingsCard, { backgroundColor: theme.colors.card }]}
      >
        <View style={styles.iconMainContainer}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setMode("light")}
          >
            <Text style={{ marginRight: "auto", color: theme.colors.text }}>
              Light Mode
            </Text>
            <Checkbox
              style={styles.checkbox}
              value={mode === "light"}
              onValueChange={() => setMode("light")}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.iconMainContainer}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setMode("dark")}
          >
            <Text style={{ marginRight: "auto", color: theme.colors.text }}>
              Dark Mode
            </Text>
            <Checkbox
              style={styles.checkbox}
              value={mode === "dark"}
              onValueChange={() => setMode("dark")}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  settingsCard: {
    display: "flex",
    justifyContent: "center",
    borderColor: "black",
    width: "100%",
    borderWidth: 0,
    padding: 10,
    borderRadius: 10,
  },

  iconMainContainer: {
    display: "flex",
    marginRight: "auto",
    gap: 30,
    width: "100%",
    paddingTop: 10,
    paddingBottom: 10,
  },
  iconContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  checkbox: {
    margin: 8,
  },
});
