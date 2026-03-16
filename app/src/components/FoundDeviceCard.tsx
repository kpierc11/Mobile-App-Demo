import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@react-navigation/native";
import { View, TouchableOpacity, Image, Text, StyleSheet } from "react-native";
import { HbsDevice } from "../types/hbsDevice";
import { Peripheral } from "react-native-ble-manager";

interface FoundDeviceProps {
  peripheral: HbsDevice;
  connectToDevice: () => Promise<void>;
  getSignalIcon:
    | "wifi-strength-1"
    | "wifi-strength-2"
    | "wifi-strength-3"
    | "wifi-strength-4"
    | "wifi-strength-outline";
  identifyUnit: () => void;
  stopIdentifyUnit: () => void;
}

export default function FoundDeviceCard({
  peripheral,
  connectToDevice,
  identifyUnit,
  stopIdentifyUnit,
  getSignalIcon,
}: FoundDeviceProps) {
  const theme = useTheme();
  const foundDeviceImage = theme.dark
    ? require("../../assets/images/hbs-logo-white.png")
    : require("../../assets/images/hbs-splash.png");

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
            size={28}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={identifyUnit}>
          <MaterialCommunityIcons
            style={{ marginRight: 20 }}
            name={"lightbulb-on-10"}
            size={28}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <View>
          <MaterialCommunityIcons
            name={getSignalIcon}
            size={20}
            color={theme.colors.primary}
          />
        </View>
      </View>

      {/* Device info */}
      <View style={{ flexDirection: "row", gap: 30 }}>
        <Image style={styles.foundDeviceImage} source={foundDeviceImage} />
        <View>
          <Text style={{ color: theme.colors.text }}>
            {formatDeviceID(peripheral.device.id)}
          </Text>
          <Text style={{ maxWidth: 150, color: theme.colors.text }}>
            {peripheral.storedDeviceName
              ? peripheral.storedDeviceName
              : peripheral.device.name}
          </Text>
        </View>
      </View>

      {/* Connect button */}
      <View style={{ flexDirection: "row", gap: 5, marginTop: 5 }}>
        <View
          style={{
            flexDirection: "row",
            gap: 5,
            marginRight: "auto",
          }}
        >
          <TouchableOpacity style={styles.button} onPress={connectToDevice}>
            <Text style={{ color: "white", fontSize: 12 }}>Connect</Text>
            <MaterialCommunityIcons
              name="connection"
              size={14}
              color={"white"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  deviceTitle: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "left",
    color: "black",
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
  foundDeviceImage: {
    width: 120,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    objectFit: "contain",
    height: 80,
    borderRadius: 15,
  },
});
