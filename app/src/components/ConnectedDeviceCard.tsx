import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@react-navigation/native";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { HbsDevice } from "../types/hbsDevice";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import React, { useContext, useState } from "react";
import { UnitDataContext } from "./UnitDataProvider";

const imageMap: Record<number, any> = {
  24: require("../../assets/images/devices/solar-controller.png"),
  25: require("../../assets/images/devices/ac-power-supply.png"),
  40: require("../../assets/images/devices/24-volt-ac-dc-power.png"),
};

interface ConnectedCardProps {
  connectedDevice: HbsDevice;
  imageLink: string;
  getSignalIcon:
    | "wifi-strength-1"
    | "wifi-strength-2"
    | "wifi-strength-3"
    | "wifi-strength-4"
    | "wifi-strength-outline";
  identifyUnit: () => void;
  stopIdentifyUnit: () => void;
  disconnectDevice: () => Promise<void>;
}

export default function ConnectedDeviceCard({
  connectedDevice,
  imageLink,
  getSignalIcon,
  identifyUnit,
  stopIdentifyUnit,
  disconnectDevice,
}: ConnectedCardProps) {
  const theme = useTheme();
  const { unitData, setUnitData, unitHID} =
    useContext(UnitDataContext);

  const formatDeviceID = (deviceName: string) => {
    return deviceName.slice(0, 7);
  };
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      {/* RSSI */}
      <View
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "row",
          width: "100%",
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          style={{ marginRight: "auto" }}
          onPress={stopIdentifyUnit}
        >
          <MaterialCommunityIcons
            name={"lightbulb-off-outline"}
            size={30}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={identifyUnit}>
          <MaterialCommunityIcons
            style={{ marginRight: 20 }}
            name={"lightbulb-on-10"}
            size={30}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <View>
          <MaterialCommunityIcons
            name={getSignalIcon}
            size={24}
            color={theme.colors.primary}
          />
        </View>
      </View>

      {/* Device Info */}
      <View style={{ flexDirection: "row", gap: 30 }}>
        {unitHID ? (
          <Image
            style={styles.connectedDeviceImage}
            source={imageMap[unitHID]}
          />
        ) : (
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              height: 120,
              width: 100,
            }}
          >
            <ActivityIndicator style={{ marginTop: 20 }} size="large" />
          </View>
        )}

        <View style={{ flexBasis: "50%" }}>
          <Text style={{ fontWeight: "bold", color: theme.colors.text }}>
            {formatDeviceID(connectedDevice.device.id)}
          </Text>
          <Text style={{ maxWidth: 300, color: theme.colors.text }}>
            {connectedDevice.storedDeviceName
              ? connectedDevice.storedDeviceName
              : connectedDevice.device.name}
          </Text>
        </View>
      </View>

      {/* Disconnect */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
        }}
      >
        <View style={{ marginRight: "auto" }}>
          <TouchableOpacity style={styles.button} onPress={disconnectDevice}>
            <Text style={{ color: "white", fontSize: 12 }}>Disconnect</Text>
            <AntDesign name="disconnect" size={14} color={"white"} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push({
              pathname: "/device/[id]",
              params: {
                id: connectedDevice.device.id,
                deviceDetails: JSON.stringify({
                  ...connectedDevice.device,
                  imageURL: imageLink,
                }),
              },
            });
          }}
        >
          <Text style={{ color: "white", fontSize: 12 }}>DeviceDetails</Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={12}
            color={"white"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
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
    fontWeight: "bold",
    textAlign: "left",
    color: "black",
  },

  subHeading: {
    fontSize: 18,
    fontWeight: "400",
    textAlign: "left",
    color: "black",
    marginBottom: 20,
  },

  card: {
    borderColor: "black",
    width: "100%",
    borderWidth: 0,
    marginBottom: 20,
    padding: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1.84,
    elevation: 2,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  button: {
    backgroundColor: "#215387",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 5,
    padding: 10,
    marginTop: 20,
  },
  connectedDeviceImage: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    objectFit: "cover",
    height: 120,
    width: "100%",
    maxWidth:400,
    borderRadius: 15,
  },
  foundDeviceImage: {
    width: 150,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    objectFit: "contain",
    height: 80,
    borderRadius: 15,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
