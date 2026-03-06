import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Checkbox } from "expo-checkbox";
import { useTheme } from "@react-navigation/native";

export default function Language() {
  const [isChecked, setChecked] = useState(true);
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Language</Text>

      <View style={[styles.settingsCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.iconMainContainer}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setChecked(true)}
          >
            <Text style={{ marginRight: "auto", color: theme.colors.text }}>English</Text>
            <Checkbox
              style={styles.checkbox}
              value={isChecked}
              onValueChange={setChecked}
              color={isChecked ? theme.colors.primary : undefined}
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