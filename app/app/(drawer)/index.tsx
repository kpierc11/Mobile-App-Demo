import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BleManager, { Peripheral } from "react-native-ble-manager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Packet, PacketTypes } from "@/hooks/Packet";
import { UnitDataContext } from "@/components/UnitDataProvider";

const SERVICE_UUID = "00001000-0000-1000-8000-00805f9b34fb";
const WRITE_CHAR = "00001001-0000-1000-8000-00805f9b34fb";
const READ_CHAR = "00001002-0000-1000-8000-00805f9b34fb";
const READ_DESC = "00002902-0000-1000-8000-00805f9b34fb";
const SCAN_DURATION = 5;

interface HbsDevice {
  device: Peripheral;
  data: any[];
}

const imageMap: Record<number, any> = {
  24: require("../../assets/images/devices/solar-controller.png"),
  25: require("../../assets/images/devices/ac-power-supply.png"),
  40: require("../../assets/images/devices/24-volt-ac-dc-power.png"),
};

export default function HomeScreen() {
  const [foundDeviceList, setFoundDeviceList] = useState<Peripheral[]>([]);
  const [restartScan, setRestartScan] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<HbsDevice>();
  const [parsedRegisterData, setParsedRegisterData] = useState<any>([]);
  const { unitData, setUnitData } = useContext(UnitDataContext);
  const [imageLink, setImageLink] = useState("");

  const sortedDevices = [...foundDeviceList].sort((a, b) => b.rssi - a.rssi);

  const packet = new Packet();

  useEffect(() => {
    BleManager.start({ showAlert: true }).then(() => {
      getConnectedDevices();
      startScanningDevices();
    });

    const onStopListener = BleManager.onStopScan(() => {
      setRestartScan(false);
      setIsScanning(false);
    });

    const onDiscoveredPeripheralListener = BleManager.onDiscoverPeripheral(
      (peripheral: Peripheral) => {
        const { name, advertising, rssi } = peripheral;
        const { isConnectable } = advertising;

        if (
          rssi > -85 &&
          isConnectable &&
          name?.toLowerCase().includes("ble#")
        ) {
          setFoundDeviceList((prev) => {
            if (prev.find((p) => p.id === peripheral.id)) return prev;
            return [peripheral, ...prev];
          });
        }
      },
    );

    const onDidUpdateValueForCharacteristicListener =
      BleManager.onDidUpdateValueForCharacteristic(
        ({ value, peripheral }: any) => {
          const returnData = new Uint8Array(value);
          packet.parsePacket(returnData).then((parsedPacket) => {
            const { type, currentPacket, regData } = parsedPacket;
            if (type == PacketTypes.PARSE_SENSOR_DATA) {
              console.log("Packet type is parse register.");
              setUnitData(regData);
            }
            setTimeout(() => {
              sendNewPacket(peripheral, currentPacket);
            }, 3000);
          });
          //setImageLink(imageMap[packet.header.source.hID]);
        },
      );

    return () => {
      onStopListener.remove();
      onDiscoveredPeripheralListener.remove();
      onDidUpdateValueForCharacteristicListener.remove();
    };
  }, []);

  const formatBleNameToMac = (
    name: string | null | undefined,
  ): string | undefined => {
    if (!name) {
      return;
    }

    let hex = name.replace(/^BLE#0x/, "");
    hex = hex.toUpperCase();

    const match = hex.match(/.{1,2}/g);
    if (!match) {
      return;
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
    } catch (error) {
      console.log("Couldn't scan devices:", error);
    }
  };

  const getSignalIcon = (rssi: number) => {
    if (rssi >= -50) return "wifi-strength-4";
    if (rssi >= -65) return "wifi-strength-3";
    if (rssi >= -75) return "wifi-strength-2";
    if (rssi >= -85) return "wifi-strength-1";
    return "wifi-strength-outline";
  };

  const connectToDevice = async (device: Peripheral) => {
    setIsConnecting(true);

    try {
      if (connectedDevice?.device.id === device.id) return;
      await BleManager.connect(device.id);

      setConnectedDevice({ device: device, data: [] });

      startDeviceNotify(device, packet.sendSetTime());
    } catch (error) {
      console.log("Couldn't connect to device", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectDevice = async (device: Peripheral) => {
    try {
      await BleManager.disconnect(device.id);

      setConnectedDevice(undefined);

      await BleManager.stopNotification(device.id, SERVICE_UUID, WRITE_CHAR);
    } catch (error) {
      console.log("Couldn't dissconnect device", error);
    }
  };

  const getConnectedDevices = async () => {
    try {
      const peripherals = await BleManager.getConnectedPeripherals([]);
      // peripherals.map((peripheral) => {
      //   setConnectedDevice([{ device: peripheral, data: [] }]);
      // });
    } catch (error) {
      console.log("Couldn't get connected devices:", error);
    }
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
      }
    } catch (error) {
      console.log("Couldn't start device notification", error);
    }
  };

  const sendNewPacket = async (deviceID: string, packet: Uint8Array) => {
    try {
      await BleManager.write(deviceID, SERVICE_UUID, WRITE_CHAR, [...packet]);
    } catch (error) {
      console.log("Couldn't send new packet:", error);
    }
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
          <Text style={{ textAlign: "center", marginTop: 20, fontSize: 18 }}>
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
          <Text style={styles.deviceTitle}>HBS Devices</Text>
          <ScrollView
            contentContainerStyle={styles.scrollView}
            refreshControl={
              <RefreshControl
                refreshing={isScanning}
                onRefresh={handleDeviceListRefresh}
              />
            }
          >
            <View style={styles.card}>
              <Text style={styles.subHeading}>No devices found.</Text>
              <Text>Pull down to scan for devices.</Text>
              <Text>Make sure Bluetooth is turned on.</Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.deviceTitle}>HBS Devices</Text>
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
              <Text style={styles.subHeading}>Connected Device</Text>
            </View>

            {/* Device cards */}

            <View style={styles.card}>
              {/* RSSI */}
              <View style={{ width: "100%", alignItems: "flex-end" }}>
                <MaterialCommunityIcons
                  name={getSignalIcon(connectedDevice.device.rssi)}
                  size={20}
                  color="#215387"
                />
              </View>

              {/* Device Info */}
              <View style={{ flexDirection: "row", gap: 30 }}>
                <Image
                  style={styles.image}
                  source={imageLink}
                  contentFit="cover"
                />

                <View>
                  <Text style={{ fontWeight: "bold" }}>
                    {formatDeviceID(connectedDevice.device.id)}
                  </Text>
                  <Text style={{ maxWidth: 150 }}>
                    {formatBleNameToMac(connectedDevice.device.name) ??
                      "Unknown"}
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
                    <AntDesign name="disconnect" size={14} color="white" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    router.push({
                      pathname: "/device/[id]",
                      params: {
                        id: connectedDevice.device.id,
                        deviceDetails: JSON.stringify({
                          ...connectedDevice.device,
                          parsedRegisterData,
                        }),
                      },
                    })
                  }
                >
                  <Text style={{ color: "white", fontSize: 12 }}>
                    DeviceDetails
                  </Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={12}
                    color="white"
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
              <Text style={styles.subHeading}>Found Devices</Text>
            </View>

            {isConnecting ? (
              <View style={{ flex: 1, paddingHorizontal: 20 }}>
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 20,
                    fontSize: 18,
                  }}
                >
                  Connecting to Device...
                </Text>
                <ActivityIndicator style={{ marginTop: 20 }} size="large" />
              </View>
            ) : (
              <></>
            )}

            {/* Device list */}
            {sortedDevices
              .sort((a, b) => b.rssi - a.rssi)
              .map((device: Peripheral) => (
                <View key={device.id} style={styles.card}>
                  {/* RSSI */}
                  <View style={{ width: "100%", alignItems: "flex-end" }}>
                    <MaterialCommunityIcons
                      name={getSignalIcon(device.rssi)}
                      size={20}
                      color="#215387"
                    />
                  </View>

                  {/* Device info */}
                  <View style={{ flexDirection: "row", gap: 30 }}>
                    <Image
                      style={styles.image}
                      source={require("../../assets/images/solaraft-qdb-transparent.png")}
                      contentFit="cover"
                    />

                    <View>
                      <Text style={{ fontWeight: "bold" }}>
                        {formatDeviceID(device.id)}
                      </Text>
                      <Text style={{ maxWidth: 150 }}>
                        {formatBleNameToMac(device.name) ?? "Unknown"}
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
                        onPress={() => connectToDevice(device)}
                      >
                        <Text style={{ color: "white", fontSize: 12 }}>
                          Connect
                        </Text>
                        <MaterialCommunityIcons
                          name="connection"
                          size={14}
                          color="white"
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
    backgroundColor: "#fff",
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
  image: {
    flex: 1,
    width: "auto",
    height: 100,
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
