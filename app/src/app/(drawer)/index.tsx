import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BleManager, { Peripheral } from "react-native-ble-manager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Packet, PacketTypes } from "@/src/utils/Packet";
import { UnitDataContext } from "@/src/components/UnitDataProvider";
import { SettingsStore } from "@/src/hooks/useStorage";
import { useTheme } from "@react-navigation/native";

const SERVICE_UUID = "00001000-0000-1000-8000-00805f9b34fb";
const WRITE_CHAR = "00001001-0000-1000-8000-00805f9b34fb";
const READ_CHAR = "00001002-0000-1000-8000-00805f9b34fb";
const READ_DESC = "00002902-0000-1000-8000-00805f9b34fb";
const SCAN_DURATION = 5;

interface HbsDevice {
  device: Peripheral;
  storedDeviceName: string;
}

let currentQueuedPacket: Uint8Array = new Uint8Array();

const imageMap: Record<number, any> = {
  24: require("../../../assets/images/devices/solar-controller.png"),
  25: require("../../../assets/images/devices/ac-power-supply.png"),
  40: require("../../../assets/images/devices/24-volt-ac-dc-power.png"),
};

export default function HomeScreen() {
  const [foundDeviceList, setFoundDeviceList] = useState<HbsDevice[]>([]);
  const [restartScan, setRestartScan] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<HbsDevice>();
  const [parsedRegisterData, setParsedRegisterData] = useState<any>([]);
  const { unitData, setUnitData, setUnitImageURL, unitImageURL } =
    useContext(UnitDataContext);
  const [imageLink, setImageLink] = useState("");
  const sortedDevices = [...foundDeviceList].sort(
    (a, b) => b.device.rssi - a.device.rssi,
  );

  const theme = useTheme();
  const packet = new Packet();
  const foundDeviceImage = theme.dark
    ? require("../../../assets/images/hbs-logo-white.png")
    : require("../../../assets/images/hbs-splash.png");

  useEffect(() => {
    const initBLE = async () => {
      const permissionsGranted = await requestBLEPermissions();
      if (!permissionsGranted) {
        return;
      }

      await BleManager.start({ showAlert: true });

      getConnectedDevices();
      startScanningDevices();

      const onStopListener = BleManager.onStopScan(() => {
        setRestartScan(false);
        setIsScanning(false);
      });

      const onDiscoveredPeripheralListener = BleManager.onDiscoverPeripheral(
        (peripheral: Peripheral) => {
          const { name, advertising, rssi, id } = peripheral;
          const { isConnectable } = advertising;

          if (
            rssi > -85 &&
            isConnectable &&
            name?.toLowerCase().includes("ble#")
          ) {
            getStoredDeviceName(id).then((storedName) => {
              setFoundDeviceList((prev) => {
                const exists = prev.some((item) => item.device.id === id);
                if (exists) return prev;
                return [
                  ...prev,
                  { device: peripheral, storedDeviceName: storedName || "" },
                ];
              });
            });
          }
        },
      );

      const onDidUpdateValueForCharacteristicListener =
        BleManager.onDidUpdateValueForCharacteristic(
          ({ value, peripheral }: any) => {
            const returnData = new Uint8Array(value);
            handleResponsePacket(returnData, peripheral);
          },
        );

      return () => {
        onStopListener.remove();
        onDiscoveredPeripheralListener.remove();
        onDidUpdateValueForCharacteristicListener.remove();
      };
    };

    initBLE();
  }, []);

  async function requestBLEPermissions() {
    if (Platform.OS === "android" && Platform.Version >= 31) {
      // Android 12+
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return granted;
    } else if (Platform.OS === "android") {
      // Android <12
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "BLE scanning requires location permission",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  const getStoredDeviceName = async (deviceID: string) => {
    try {
      const storedName = await SettingsStore.getValueFor(deviceID);
      return storedName ? storedName : "";
    } catch (error) {}
  };

  const formatBleNameToMac = (name: string): string => {
    let hex = name.replace(/^BLE#0x/, "");
    hex = hex.toUpperCase();

    const match = hex.match(/.{1,2}/g);
    if (!match) {
      return name;
    }

    return match.join(":");
  };

  const formatDeviceID = (deviceName: string) => {
    return deviceName.slice(0, 7);
  };

  const startScanningDevices = async () => {
    if (isScanning) {
      return;
    }
    try {
      setIsScanning(true);
      setFoundDeviceList([]);
      const scanOptions = {
        serviceUUIDs: [],
        seconds: SCAN_DURATION,
        allowDuplicates: false,
      };
      await BleManager.scan(scanOptions);
    } catch (error) {}
  };

  const getSignalIcon = (rssi: number) => {
    if (rssi >= -50) return "wifi-strength-4";
    if (rssi >= -61) return "wifi-strength-3";
    if (rssi >= -71) return "wifi-strength-2";
    if (rssi >= -81) return "wifi-strength-1";
    return "wifi-strength-outline";
  };

  const connectToDevice = async (device: Peripheral) => {
    setIsConnecting(true);
    const CONNECTION_TIMEOUT = 6000;
    try {
      if (connectedDevice?.device.id === device.id) return;
      if (connectedDevice) {
        await disconnectDevice(connectedDevice.device);
      }

      await Promise.race([
        BleManager.connect(device.id),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Connection timed out")),
            CONNECTION_TIMEOUT,
          ),
        ),
      ]);

      if (Platform.OS === "android" && Platform.Version >= 21) {
        BleManager.requestMTU(device.id, 512)
          .then((mtu) => {
            // Success code
            console.log("MTU size changed to " + mtu + " bytes");
          })
          .catch((error) => {
            // Failure code
            console.log(error);
          });
      }

      let deviceID = "";

      if (device.id) {
        deviceID = device.id;
      }

      const storedDeviceName = await getStoredDeviceName(deviceID);

      let storedName = "";

      if (storedDeviceName) {
        storedName = storedDeviceName;
      }

      setConnectedDevice({
        device: device,
        storedDeviceName: storedName,
      });

      startDeviceNotify(device, packet.sendSetTime());
    } catch (error) {
      console.log(error);
    } finally {
      setIsConnecting(false);
      console.log("connected");
    }
  };

  const disconnectDevice = async (device: Peripheral) => {
    try {
      try {
        await BleManager.stopNotification(device.id, SERVICE_UUID, WRITE_CHAR);
      } catch (e) {
        console.log("Notification was not active");
      }

      await BleManager.disconnect(device.id);
      setImageLink("");
      setUnitData([]);

      setConnectedDevice(undefined);
    } catch (error) {
      console.log(error);
    }
  };

  const getConnectedDevices = async () => {
    try {
      await BleManager.getConnectedPeripherals([]);
    } catch (error) {}
  };

  const startDeviceNotify = async (device: Peripheral, packet: Uint8Array) => {
    try {
      const services = await BleManager.retrieveServices(device.id);
      if (services) {
        await BleManager.startNotification(device.id, SERVICE_UUID, READ_CHAR);
        await new Promise((res) => setTimeout(res, 200));
        await BleManager.write(device.id, SERVICE_UUID, WRITE_CHAR, [
          ...packet,
        ]);
        currentQueuedPacket = packet;
      }
    } catch (error) {}
  };

  const sendNewPacket = async (deviceID: string, packet: Uint8Array) => {
    if (packet == currentQueuedPacket) {
      return;
    }
    try {
      await BleManager.write(deviceID, SERVICE_UUID, WRITE_CHAR, [...packet]);
    } catch (error) {}

    currentQueuedPacket = packet;
  };

  const handleResponsePacket = async (
    returnData: Uint8Array<any>,
    id: string,
  ) => {
    try {
      const parsedReturnData = await packet.parsePacket(returnData);
      let sendPacket = null;
      const { type, currentPacket, regData } = parsedReturnData;

      setImageLink(imageMap[packet.header.source.hID]);
      setUnitImageURL(imageLink);

      if (type == PacketTypes.GET_SENSOR_DATA) {
        sendPacket = currentPacket;
      }

      if (type == PacketTypes.PARSE_SENSOR_DATA) {
        setUnitData(regData);
        sendPacket = packet.sendGetSensorData();
      }

      if (sendPacket) {
        setTimeout(() => {
          sendNewPacket(id, sendPacket);
        }, 3000);
      }
    } catch (error) {}
  };

  const handleDeviceListRefresh = () => {
    setTimeout(() => {
      startScanningDevices();
    }, 800);
  };

  if (isScanning) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <Text
            style={[
              { textAlign: "center", marginTop: 20, fontSize: 18 },
              { color: theme.colors.text },
            ]}
          >
            Scanning for Devices:
          </Text>
          <ActivityIndicator style={{ marginTop: 20 }} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (foundDeviceList.length == 0 && !connectedDevice) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <Text style={[styles.deviceTitle, { color: theme.colors.text }]}>
            HBS Devices
          </Text>
          <ScrollView
            contentContainerStyle={styles.scrollView}
            refreshControl={
              <RefreshControl
                refreshing={isScanning}
                onRefresh={handleDeviceListRefresh}
              />
            }
          >
            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.subHeading, { color: theme.colors.text }]}>
                No devices found.
              </Text>
              <Text style={{ color: theme.colors.text }}>
                Pull down to scan for devices.
              </Text>
              <Text style={{ color: theme.colors.text }}>
                Make sure Bluetooth is turned on.
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.deviceTitle, { color: theme.colors.text }]}>
        HBS Devices
      </Text>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isScanning}
            onRefresh={handleDeviceListRefresh}
          />
        }
      >
        {connectedDevice && (
          <>
            {/* Header */}
            <View style={{ alignSelf: "flex-start" }}>
              <Text style={[styles.subHeading, { color: theme.colors.text }]}>
                Connected Device
              </Text>
            </View>

            {/* Device cards */}

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
                  onPress={() =>
                    sendNewPacket(
                      connectedDevice.device.id,
                      packet.sendStopIdentifyUnit(),
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name={"lightbulb-off-outline"}
                    size={28}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    sendNewPacket(
                      connectedDevice.device.id,
                      packet.sendIdentifyUnit(),
                    )
                  }
                >
                  <MaterialCommunityIcons
                    style={{ marginRight: 20 }}
                    name={"lightbulb-on-10"}
                    size={28}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>

                <View>
                  <MaterialCommunityIcons
                    name={getSignalIcon(connectedDevice.device.rssi)}
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>
              </View>

              {/* Device Info */}
              <View style={{ flexDirection: "row", gap: 30 }}>
                {imageLink ? (
                  <Image
                    style={styles.connectedDeviceImage}
                    source={imageLink}
                    contentFit="cover"
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
                  <Text
                    style={{ fontWeight: "bold", color: theme.colors.text }}
                  >
                    {formatDeviceID(connectedDevice.device.id)}
                  </Text>
                  <Text style={{ maxWidth: 150, color: theme.colors.text }}>
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
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => disconnectDevice(connectedDevice.device)}
                  >
                    <Text style={{ color: "white", fontSize: 12 }}>
                      Disconnect
                    </Text>
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
                          parsedRegisterData,
                        }),
                      },
                    });
                  }}
                >
                  <Text style={{ color: "white", fontSize: 12 }}>
                    DeviceDetails
                  </Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={12}
                    color={"white"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
        {sortedDevices.length > 0 ? (
          <>
            {/* Title */}
            <View style={{ alignSelf: "flex-start", marginBottom: 8 }}>
              <Text style={[styles.subHeading, { color: theme.colors.text }]}>
                Found Devices
              </Text>
            </View>

            {isConnecting ? (
              <View style={{ flex: 1, paddingHorizontal: 20 }}>
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 20,
                    fontSize: 18,
                    color: theme.colors.text,
                  }}
                >
                  Connecting to Device...
                </Text>
                <ActivityIndicator
                  style={{ marginTop: 20, marginBottom: 40 }}
                  size="large"
                />
              </View>
            ) : (
              <></>
            )}

            {/* Device list */}
            {sortedDevices
              .sort((a, b) => b.device.rssi - a.device.rssi)
              .map((item: HbsDevice, index) => (
                <View
                  key={item.device.id}
                  style={[styles.card, { backgroundColor: theme.colors.card }]}
                >
                  {/* RSSI */}
                  <View style={{ width: "100%", alignItems: "flex-end" }}>
                    <MaterialCommunityIcons
                      name={getSignalIcon(item.device.rssi)}
                      size={20}
                      color={theme.colors.primary}
                    />
                  </View>

                  {/* Device info */}
                  <View style={{ flexDirection: "row", gap: 30 }}>
                    <Image
                      style={styles.foundDeviceImage}
                      source={foundDeviceImage}
                      contentFit="cover"
                    />
                    <View>
                      <Text style={{ color: theme.colors.text }}>
                        {formatDeviceID(item.device.id)}
                      </Text>
                      <Text style={{ maxWidth: 150, color: theme.colors.text }}>
                        {item.storedDeviceName
                          ? item.storedDeviceName
                          : item.device.name}
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
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() => connectToDevice(item.device)}
                      >
                        <Text style={{ color: "white", fontSize: 12 }}>
                          Connect
                        </Text>
                        <MaterialCommunityIcons
                          name="connection"
                          size={14}
                          color={"white"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
          </>
        ) : (
          <></>
        )}
      </ScrollView>
    </SafeAreaView>
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
