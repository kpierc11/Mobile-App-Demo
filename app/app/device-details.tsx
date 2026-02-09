import { UnitDataContext } from "@/components/UnitDataProvider";
import { Register } from "@/hooks/Register";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import { useContext } from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export default function DeviceDetails() {
  const { deviceDetails } = useLocalSearchParams();
  const { unitData } = useContext(UnitDataContext);
  //console.log("Unit Data" + unitData);

  unitData.forEach((data)=>{
    console.log(data);
  })

  const deviceString = Array.isArray(deviceDetails)
    ? deviceDetails[0]
    : deviceDetails;

  if (!deviceString) return <Text>No device data</Text>;

  const device = JSON.parse(deviceString);

  const { id, name, type } = device;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Image
            source={require("../assets/images/solaraft-qdb-transparent.png")}
            style={styles.image}
            resizeMode="cover"
          />
          <View>
            <Text style={styles.header}>{name}</Text>
          </View>
        </View>
        <View
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <View style={styles.icon}>
                <MaterialIcons
                  name="battery-charging-full"
                  size={20}
                  color="white"
                />
              </View>
            </View>
            <Text style={styles.subHeading}>Battery Voltage</Text>
            <Text style={styles.deviceInfoText}>
              {unitData.get("Battery Voltage")}
            </Text>
          </View>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <View style={styles.icon}>
                <MaterialIcons
                  name="device-thermostat"
                  size={20}
                  color="white"
                />
              </View>
            </View>
            <Text style={styles.subHeading}>Internal Temperature (C)</Text>
            <Text style={styles.deviceInfoText}>22C</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <View style={styles.icon}>
                <MaterialIcons name="electric-bolt" size={20} color="white" />
              </View>
            </View>
            <Text style={styles.subHeading}>Sonic 1 Status/Voltage</Text>
            <Text style={styles.deviceInfoText}>status: Not Detected</Text>
            <Text style={styles.deviceInfoText}>voltage: Not Detected</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <View style={styles.icon}>
                <MaterialIcons name="electric-bolt" size={20} color="white" />
              </View>
            </View>
            <Text style={styles.subHeading}>Sonic 2 Status/Voltage</Text>
            <Text style={styles.deviceInfoText}>status: Not Detected</Text>
            <Text style={styles.deviceInfoText}>voltage: Not Detected</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <View style={styles.icon}>
                <MaterialIcons name="solar-power" size={20} color="white" />
              </View>
            </View>
            <Text style={styles.subHeading}>Sonic Power</Text>
            <Text style={styles.deviceInfoText}>Disabled</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",

    borderTopWidth: 2,
    borderTopColor: "black",
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
    alignItems: "center",
    paddingVertical: 10,
    fontSize: 24,
  },

  scrollView: {
    marginTop: 20,
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
    fontSize: 18,
    fontWeight: "500",
    textAlign: "left",
    color: "black",
    marginBottom: 4,
    marginTop: 10,
  },

  deviceInfoText: {
    fontSize: 16,
    fontWeight: 300,
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
