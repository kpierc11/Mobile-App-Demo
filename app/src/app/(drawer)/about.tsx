import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Image } from "expo-image";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function About() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>About</Text>
      <View
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Image
          style={styles.image}
          source={require("../../../assets/images/myquattro-app-icon.png")}
          contentFit="cover"
        />
        <View style={{ marginTop: 10, alignItems: "center" }}>
          <Text>MyQuattro</Text>
          <Text>Version: Beta 1.0.0</Text>
        </View>
      </View>
      <View style={styles.settingsCard}>
        <View style={styles.iconMainContainer}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() =>
              Linking.openURL("https://www.hydro-bioscience.com/about-us/")
            }
          >
            <MaterialCommunityIcons name="web" size={24} color="black" />
            <Text style={{ marginRight: "auto" }}>Who We Are</Text>
            <MaterialIcons
              style={{ alignContent: "flex-end" }}
              name="chevron-right"
              size={20}
              color="black"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() =>
                router.navigate("/about/supported-devices")
            }
          >
            <MaterialIcons name="device-hub" size={24} color="black" />
            <Text style={{ marginRight: "auto" }}>Supported Devices</Text>
            <MaterialIcons
              style={{ alignContent: "flex-end" }}
              name="chevron-right"
              size={20}
              color="black"
            />
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{ display: "flex", alignItems: "center", marginTop: "100%" }}
      >
        <Text>©{new Date().getFullYear()} Hydro Bioscience</Text>
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
    gap: 20,
    width: "100%",
  },
  iconContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  image: {
    height: 75,
    width: 75,
    borderRadius: 15,
  },
});
