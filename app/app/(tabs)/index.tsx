import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BleManager, { Peripheral } from "react-native-ble-manager";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Packet } from "@/hooks/Packet";

const SERVICE_UUID = "00001000-0000-1000-8000-00805f9b34fb";
const WRITE_CHAR = "00001001-0000-1000-8000-00805f9b34fb";
const READ_CHAR = "00001002-0000-1000-8000-00805f9b34fb";
const READ_DESC = "00002902-0000-1000-8000-00805f9b34fb";
const SCAN_DURATION = 5;

export default function HomeScreen() {
  const [deviceList, setDeviceList] = useState<Peripheral[]>([]);
  const [restartScan, setRestartScan] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [connectedDeviceData, setConnectedDeviceData] = useState<string>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<Peripheral[]>([]);

  const sortedDevices = deviceList.sort((a, b) => b.rssi - a.rssi);

  const packet = new Packet();

  //initialize bluetooth manager
  useEffect(() => {
    BleManager.start({ showAlert: true }).then(() => {
      console.log("BLE initialized");
      getConnectedDevices();
      startScanningDevices();
    });

    const onStopListener = BleManager.onStopScan(() => {
      console.log("scan finished");
      setRestartScan(false);
      setIsScanning(false);
    });

    const onDiscoveredPeripheralListener = BleManager.onDiscoverPeripheral(
      (peripheral: Peripheral) => {
        const { id, name, advertising, rssi } = peripheral;
        const { isConnectable, serviceUUIDs } = advertising;

        // console.log("found device");
        // console.log(`Device Id: ${id}`);
        // console.log(`Device Name: ${name ?? "Unknown"}`);
        // console.log(`Device is connectable: ${isConnectable}`);

        if (
          rssi > -85 &&
          isConnectable &&
          name?.toLowerCase().includes("ble#")
        ) {
          setDeviceList((prev) => {
            // Avoid duplicates
            if (prev.find((p) => p.id === peripheral.id)) return prev;

            return [peripheral, ...prev];
          });
        }
      },
    );

    const onDidUpdateValueForCharacteristicListener =
      BleManager.onDidUpdateValueForCharacteristic(
        ({ value, peripheral, characteristic, service }: any) => {
          console.log("Notification received:");

          //console.log(value);
          const returnData = new Uint8Array(value);
          const { } = packet.parsePacket(returnData);

          console.log("Return Data:", returnData.length);
          console.log("Return Data:", returnData);
          setConnectedDeviceData(
            connectedDeviceData + "ReturnData: " + returnData,
          );
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

  const startScanningDevices = () => {
    if (!isScanning) {
      setIsScanning(true);
      const scanOptions = {
        serviceUUIDs: [],
        seconds: SCAN_DURATION,
        allowDuplicates: false,
      };
      BleManager.scan(scanOptions).then(() => {
        // Success code
        console.log(scanOptions);
        console.log("Scan started");
      });
    }
  };

  const getSignalIcon = (rssi: number) => {
    if (rssi >= -50) return "wifi-strength-4";
    if (rssi >= -65) return "wifi-strength-3";
    if (rssi >= -75) return "wifi-strength-2";
    if (rssi >= -85) return "wifi-strength-1";
    return "wifi-strength-outline";
  };

  const connectToDevice = (device: Peripheral) => {
    console.log("Trying to connect to device.");
    setIsConnecting(true);

    BleManager.connect(device.id)
      .then(() => {
        console.log("connected to device!");
        setIsConnecting(false);
        setConnectedDevices((prev) => {
          if (prev.find((d) => d.id === device.id)) return prev;
          return [device, ...prev];
        });

        let packet = new Packet();
        packet.sendSetTimePacket();

        const getInitialData = new Uint8Array([
          0xb2, 0xc2, 0x19, 0x00, 0x00, 0x00, 0xff, 0x1f, 0x00, 0x00, 0x00,
          0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
          0x00, 0x00, 0x01, 0x05, 0x00, 0x0a, 0x00, 0x0d, 0x00, 0x08, 0x00,
          0x0e, 0x00, 0x09, 0x00, 0x04, 0x00, 0x01, 0x00, 0x13,
        ]);

        readDeviceData(device, packet.sendSetTimePacket());

        readDeviceData(device, getInitialData);
      })
      .catch((error) => {
        setIsConnecting(false);
        console.log(error);
      });
  };

  const disconnectDevice = (device: Peripheral) => {
    console.log("Disconnected device.");
    BleManager.disconnect(device.id)
      .then(() => {
        console.log("disconnected device!");
        setConnectedDevices(connectedDevices.filter((d) => d.id !== device.id));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getConnectedDevices = () => {
    BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
      console.log("Connected peripherals: " + peripheralsArray.length);
      setConnectedDevices(peripheralsArray);
    });
  };

  const readDeviceData = (device: Peripheral, packet: Uint8Array) => {
    BleManager.retrieveServices(device.id).then((peripheralInfo) => {
      //console.log("Peripheral info:", peripheralInfo);

      BleManager.startNotification(device.id, SERVICE_UUID, READ_CHAR)
        .then(() => {
          console.log("Notification started");
          
          BleManager.write(device.id, SERVICE_UUID, WRITE_CHAR, [...packet])
            .then(() => console.log("Write OK"))
            .catch((err) => console.log("Write error:", err));
        })
        .catch((error) => {
          console.log(error);
        });
    });
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Modal
        animationType="slide"
        backdropColor={"rgba(0, 0, 0, 0.4)"}
        visible={isConnecting}
      >
        <View style={styles.centeredView}>
          <View style={{}}>
            <ActivityIndicator
              style={{ marginTop: 20 }}
              size="large"
              color="#215387"
            />
            <Text style={{ color: "white", fontSize: 20 }}>
              Connecting to device...
            </Text>
          </View>
        </View>
      </Modal>
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
          {connectedDevices.length > 0 && (
            <>
              {/* Header */}
              <View style={{ alignSelf: "flex-start" }}>
                <Text style={styles.subHeading}>Connected Devices</Text>
              </View>

              {/* Device cards */}
              {connectedDevices.map((device: Peripheral, index) => (
                <View key={device.id ?? index} style={styles.card}>
                  {/* RSSI */}
                  <View style={{ width: "100%", alignItems: "flex-end" }}>
                    <MaterialCommunityIcons
                      name={getSignalIcon(device.rssi)}
                      size={20}
                      color="#215387"
                    />
                  </View>

                  {/* Device Info */}
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
                        onPress={() => disconnectDevice(device)}
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
                        router.navigate({
                          pathname: "/device-details",
                          params: {
                            deviceDetails: JSON.stringify(device),
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
                  <View>
                    <Text>{connectedDeviceData}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
          {sortedDevices.length > 0 ? (
            <>
              {/* Title */}
              <View style={{ alignSelf: "flex-start", marginBottom: 8 }}>
                <Text style={styles.subHeading}>Found Devices</Text>
              </View>

              {/* Device list */}
              {sortedDevices.map((device: Peripheral) => (
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
            /* Empty state */
            <View style={styles.card}>
              <Text style={styles.subHeading}>No devices found.</Text>
              <Text>Pull down to scan for devices.</Text>
              <Text>Make sure Bluetooth is turned on.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingTop: StatusBar.currentHeight,
    borderTopWidth: 2,
    borderTopColor: "black",
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
