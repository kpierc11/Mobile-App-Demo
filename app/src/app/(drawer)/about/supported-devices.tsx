import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@react-navigation/native";

export default function SupportedDevices() {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Supported Devices:
      </Text>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Image
          style={styles.image}
          source={require("../../../../assets/images/devices/solar-controller.png")}
          contentFit="cover"
        />
        <View style={styles.subTitleContainer}>
          <Text style={[styles.subTitle, { color: theme.colors.text }]}>
            24V Solar Charger/Controller Solar Controller
          </Text>
          <Text style={{ color: theme.colors.text }}>
            Model Number:00QA-40V160A65-01
          </Text>
        </View>

        <Image
          style={styles.image}
          source={require("../../../../assets/images/devices/ac-power-supply.png")}
          contentFit="cover"
        />
        <View style={styles.subTitleContainer}>
          <Text style={[styles.subTitle, { color: theme.colors.text }]}>
            85Vac-264Vac Universal Power Supply
          </Text>
          <Text style={{ color: theme.colors.text }}>
            Model Number:44Qx-40V160A65-01
          </Text>
        </View>

        <Image
          style={styles.image}
          source={require("../../../../assets/images/devices/24-volt-ac-dc-power.png")}
          contentFit="cover"
        />
        <View style={styles.subTitleContainer}>
          <Text style={[styles.subTitle, { color: theme.colors.text }]}>
            24V AC or DC Power Supply
          </Text>
          <Text style={{ color: theme.colors.text }}>
            Model Number:45QA-40V160A65-01
          </Text>
        </View>
      </ScrollView>
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