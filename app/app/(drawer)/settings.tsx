import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TextInput, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function Settings() {
  const [value, setValue] = useState("");

  const handleChange = (text: string) => {
    // Allow only digits
    const intValue = text.replace(/[^0-9]/g, "");
    setValue(intValue);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>App Settings</Text>
      <View style={styles.settingsCard}>
        <View style={styles.iconContainer}>
          <MaterialIcons style={{}} name="sunny" size={20} color="black" />
          <Text>Appearance</Text>
        </View>
        <View>
          <MaterialIcons name="chevron-right" size={20} color="black" />
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

  iconContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginRight: "auto",
  },
});
