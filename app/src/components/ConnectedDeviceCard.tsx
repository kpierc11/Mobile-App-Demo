import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@react-navigation/native";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  ImageSourcePropType,
} from "react-native";
import { HbsDevice } from "../types/hbsDevice";
import { Peripheral } from "react-native-ble-manager";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";

interface ConnectedCardProps {
  connectedDevice: HbsDevice;
  imageLink: string;
  getSignalIcon:
    | "wifi-strength-1"
    | "wifi-strength-2"
    | "wifi-strength-3"
    | "wifi-strength-4"
    | "wifi-strength-outline";
  identifyUnit: () => Promise<void>;
  stopIdentifyUnit: () => Promise<void>;
  disconnectDevice: () => Promise<void>;
}

export default function ConnectedDeviceCard(props: ConnectedCardProps) {
  const theme = useTheme();
  const formatDeviceID = (deviceName: string) => {
    return deviceName.slice(0, 7);
  };
  console.log(props.connectedDevice.imageLink)
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
          onPress={() => props.stopIdentifyUnit()}
        >
          <MaterialCommunityIcons
            name={"lightbulb-off-outline"}
            size={28}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => props.identifyUnit()}>
          <MaterialCommunityIcons
            style={{ marginRight: 20 }}
            name={"lightbulb-on-10"}
            size={28}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <View>
          <MaterialCommunityIcons
            name={props.getSignalIcon}
            size={20}
            color={theme.colors.primary}
          />
        </View>
      </View>

      {/* Device Info */}
      <View style={{ flexDirection: "row", gap: 30 }}>
        {props.imageLink ? (
          <Image style={styles.connectedDeviceImage}  source={{ uri: props.imageLink }} />
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
            {formatDeviceID(props.connectedDevice.device.id)}
          </Text>
          <Text style={{ maxWidth: 150, color: theme.colors.text }}>
            {props.connectedDevice.storedDeviceName
              ? props.connectedDevice.storedDeviceName
              : props.connectedDevice.device.name}
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
          <TouchableOpacity
            style={styles.button}
            onPress={() => props.disconnectDevice()}
          >
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
                id: props.connectedDevice.device.id,
                deviceDetails: JSON.stringify({
                  ...props.connectedDevice.device,
                  imageURL: props.imageLink,
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
    width: 150,
    borderRadius: 15,
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
