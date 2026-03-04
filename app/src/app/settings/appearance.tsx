import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Checkbox } from "expo-checkbox";

export default function Appearance() {
  const [isDarkMode, setDarkMode] = useState(false);
  const [isLightMode, setLightMode] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Appearance</Text>
      <View style={styles.settingsCard}>
        <View style={styles.iconMainContainer}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => {setLightMode(true); setDarkMode(false);}}
          >
            <Text style={{ marginRight: "auto" }}>Light Mode</Text>
            <Checkbox
              style={styles.checkbox}
              value={isLightMode}
              onValueChange={setLightMode}
              color={isLightMode ? "#215387" : ""}
            />
          </TouchableOpacity>
        </View>
         <View style={styles.iconMainContainer}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => {setDarkMode(true); setLightMode(false)}}
          >
            <Text style={{ marginRight: "auto" }}>Dark Mode</Text>
            <Checkbox
              style={styles.checkbox}
              value={isDarkMode}
              onValueChange={setDarkMode}
              color={isDarkMode ? "#215387" : ""}
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
    backgroundColor: "#f5f5f5",
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
    backgroundColor: "#fff",
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
