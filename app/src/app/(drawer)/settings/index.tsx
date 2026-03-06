import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";

export default function Settings() {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        App Settings
      </Text>
      <View
        style={[styles.settingsCard, { backgroundColor: theme.colors.card }]}
      >
        <View style={styles.iconMainContainer}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => router.navigate("/settings/appearance")}
          >
            <MaterialIcons
              style={{}}
              name="sunny"
              size={20}
              color={theme.colors.text}
            />
            <Text
              style={[{ marginRight: "auto" }, { color: theme.colors.text }]}
            >
              Appearance
            </Text>
            <MaterialIcons
              style={{ alignContent: "flex-end" }}
              name="chevron-right"
              size={20}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => router.navigate("/settings/language")}
          >
            <Ionicons
              name="language-outline"
              size={24}
              color={theme.colors.text}
            />
            <Text
              style={[{ marginRight: "auto" }, { color: theme.colors.text }]}
            >
              Language
            </Text>
            <MaterialIcons
              style={{ alignContent: "flex-end" }}
              name="chevron-right"
              size={20}
              color={theme.colors.text}
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
});
