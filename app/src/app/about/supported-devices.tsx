import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Image } from "expo-image";

export default function SupportedDevices() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Supported Devices:</Text>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Image
          style={styles.image}
          source={require("../../../assets/images/devices/solar-controller.png")}
          contentFit="cover"
        />
        <View style={styles.subTitleContainer}>
          <Text style={styles.subTitle}>
            24V Solar Charger/Controller Solar Controller
          </Text>
          <Text>Model Number:00QA-40V160A65-01</Text>
        </View>
        <Image
          style={styles.image}
          source={require("../../../assets/images/devices/ac-power-supply.png")}
          contentFit="cover"
        />
        <View style={styles.subTitleContainer}>
          <Text style={styles.subTitle}>
            85Vac-264Vac Universal Power Supply
          </Text>
          <Text>Model Number:44Qx-40V160A65-01</Text>
        </View>
        <Image
          style={styles.image}
          source={require("../../../assets/images/devices/24-volt-ac-dc-power.png")}
          contentFit="cover"
        />
        <View style={styles.subTitleContainer}>
          <Text style={styles.subTitle}>24V AC or DC Power Supply</Text>
          <Text>Model Number:45QA-40V160A65-01</Text>
        </View>
      </ScrollView>
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
  subTitleContainer: {
    marginBottom: 60,
  },

  subTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  scrollView: {
    marginTop: 20,
    alignItems: "flex-start",
    justifyContent: "center",
    marginRight: 10,
    marginLeft: 10,
  },
  image: {
    height: 200,
    width: "100%",
    marginBottom: 20,
    borderRadius: 15,
  },
});
