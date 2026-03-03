import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

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
        <View style={styles.iconMainContainer}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => router.navigate("/settings/appearance")}
          >
            <MaterialIcons style={{}} name="sunny" size={20} color="black" />
            <Text style={{ marginRight: "auto" }}>Appearance</Text>
            <MaterialIcons
              style={{ alignContent: "flex-end" }}
              name="chevron-right"
              size={20}
              color="black"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => router.navigate("/settings/language")}
          >
            <Ionicons name="language-outline" size={24} color="black" />
            <Text style={{ marginRight: "auto" }}>Language</Text>
            <MaterialIcons
              style={{ alignContent: "flex-end" }}
              name="chevron-right"
              size={20}
              color="black"
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
});
