import { UnitDataContext } from "@/components/UnitDataProvider";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import * as Progress from "react-native-progress";

import { SafeAreaView } from "react-native-safe-area-context";

export default function DeviceDetails() {
  const { deviceDetails } = useLocalSearchParams();
  const { unitData, unitImageURL } = useContext(UnitDataContext);

  const parsedDetails = deviceDetails
    ? JSON.parse(deviceDetails as string)
    : {};

  const { name, imageURL } = parsedDetails;

  if (!deviceDetails) return <Text>No device data available..</Text>;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          {imageURL ? (
            <Image
              source={require("../../assets/images/hbs-splash.png")}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <></>
          )}
        </View>
        <View style={styles.deviceMainInfo}>
          <Text style={styles.deviceMainText}>Device ID:</Text>
          <Text style={styles.deviceMainText}>{name}</Text>
        </View>
        <View
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          {unitData.length > 0 ? (
            unitData.map(({ registerName, value }) => (
              <View key={registerName} style={styles.card}>
                {value === "Enabled" ? (
                  <View style={styles.statusEnabled}></View>
                ) : (
                  <></>
                )}
                {value === "Disabled" ? (
                  <View style={styles.statusDisabled}></View>
                ) : (
                  <></>
                )}

                {registerName.includes("Voltage") ? (
                  <Progress.Bar progress={0.8} width={100} />
                ) : (
                  <></>
                )}
                <Text style={styles.subHeading}>{registerName}</Text>
                <Text style={styles.deviceInfoText}>{value}</Text>
              </View>
            ))
          ) : (
            <View style={{ flex: 1, paddingHorizontal: 20 }}>
              <Text
                style={{ textAlign: "center", marginTop: 20, fontSize: 18 }}
              >
                Loading Device Data...
              </Text>
              <ActivityIndicator style={{ marginTop: 20 }} size="large" />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },
  iconContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  icon: {
    backgroundColor: "#215387",
    borderRadius: 99,
    padding: 8,
  },

  header: {
    alignItems: "flex-start",
    paddingVertical: 2,
    fontSize: 20,
  },

  scrollView: {
    marginTop: 0,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginLeft: 10,
  },

  deviceTitle: {
    fontSize: 25,
    fontWeight: "400",
    textAlign: "center",
    color: "black",
  },

  deviceMainInfo: {
    display: "flex",
    justifyContent: "flex-start",
    textAlign: "left",

    width: "80%",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },

  deviceMainText: {
    fontSize: 18,
    color: "black",
  },

  subHeading: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "left",
    color: "black",
    marginBottom: 4,
    marginTop: 10,
  },

  deviceInfoText: {
    marginTop: 5,
    fontSize: 19,
    fontWeight: "500",
  },

  card: {
    borderColor: "black",
    flexBasis: "48%",
    margin: "1%",
    borderWidth: 0,
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1.84,
    elevation: 2,
    borderRadius: 10,
    height: "auto",
    maxHeight: 250,
  },
  image: {
    width: 150,
    height: 150,
  },

  statusEnabled: {
    backgroundColor: "#8FBC8B",
    borderRadius: 99,
    width: 15,
    height: 15,
  },
  statusDisabled: {
    backgroundColor: "#CD5C5C",
    borderRadius: 99,
    width: 15,
    height: 15,
  },
});
