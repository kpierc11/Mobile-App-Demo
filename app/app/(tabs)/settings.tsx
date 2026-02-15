import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

export default function Settings() {
  const [value, setValue] = useState("");

  const handleChange = (text: string) => {
    // Allow only digits
    const intValue = text.replace(/[^0-9]/g, "");
    setValue(intValue);
  };

  return (
    <View style={styles.container}>
      <Text>Settings</Text>
      <View>Appearance</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    padding: 16,
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
  input: {
    height: 40,
    width: 150,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  output: {
    fontSize: 16,
    marginTop: 8,
  },
});
