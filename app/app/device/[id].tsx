import { UnitDataContext } from "@/components/UnitDataProvider";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useContext, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function DeviceDetails() {
  const { deviceDetails } = useLocalSearchParams();
  const { unitData } = useContext(UnitDataContext);

  const deviceString = Array.isArray(deviceDetails)
    ? deviceDetails[0]
    : deviceDetails;

  console.log("Device Details:", deviceDetails);

  if (!deviceString) return <Text>No device data</Text>;

  const device = JSON.parse(deviceString);

  const { id, name, type } = device;

  //const batteryVoltage = unitData.size ? unitData.get("Battery Voltage") : 0;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/solaraft-qdb-transparent.png")}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={{ display: "flex", justifyContent: "flex-start", gap: 5 }}>
          <Text style={{ fontSize: 20 }}>Device ID:</Text>
          <Text style={styles.header}>{name}</Text>
        </View>
        <View
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          {unitData.map(({registerName, value}, index) => (
            <View key={registerName} style={styles.card}>
              <View style={styles.iconContainer}>
                <View style={styles.icon}>
                  <MaterialIcons
                    name="battery-charging-full"
                    size={20}
                    color="white"
                  />
                </View>
              </View>

              <Text style={styles.subHeading}>{registerName}</Text>
              <Text style={styles.deviceInfoText}>{value}</Text>
            </View>
          ))}
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
    paddingVertical: 10,
    fontSize: 20,
  },

  scrollView: {
    marginTop: 2,
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
});
