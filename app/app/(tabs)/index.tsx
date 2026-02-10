import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  StatusBar,
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
import { Packet } from "@/hooks/Packet";
import { UnitDataContext } from "@/components/UnitDataProvider";

const SERVICE_UUID = "00001000-0000-1000-8000-00805f9b34fb";
const WRITE_CHAR = "00001001-0000-1000-8000-00805f9b34fb";
const READ_CHAR = "00001002-0000-1000-8000-00805f9b34fb";
const READ_DESC = "00002902-0000-1000-8000-00805f9b34fb";
const SCAN_DURATION = 5;

export default function HomeScreen() {
  const [deviceList, setDeviceList] = useState<Peripheral[]>([]);
  const [restartScan, setRestartScan] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<Peripheral[]>([]);
  const latestPacketRef = useRef<any>(null);
  const sendIntervalRef = useRef<any>(null);
  const { unitData, setUnitData } = useContext(UnitDataContext);

   deviceList.sort((a, b) => b.rssi - a.rssi);

  const packet = new Packet();

  useEffect(() => {
    // initialize bluetooth manager
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
          setDeviceList((prev) => {
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

          const latestPacket = packet.parsePacket(returnData);

          if (latestPacket) {
            latestPacketRef.current = {
              packet: latestPacket,
              id: peripheral,
            };
          }

          // start interval once
          if (!sendIntervalRef.current) {
            sendIntervalRef.current = setInterval(() => {
              if (latestPacketRef.current) {
                const { packet, id } = latestPacketRef.current;
                console.log("Sent Packet to:" + id , packet);
                sendNewPacket(id, packet);
              }

              if (packet.register.currentRegisterData.size > 0) {
                console.log("Registers Set:");

                setUnitData((prevMap: Map<string, number>) => {
                  const newMap: Map<string, number> = new Map(prevMap); 
                  packet.register.currentRegisterData.forEach(
                    (value: number, key: string) => {
                      newMap.set(key, value);
                    },
                  );
                  return newMap;
                });
              }
            }, 2000);
          }
        },
      );

    return () => {
      onStopListener.remove();
      onDiscoveredPeripheralListener.remove();
      onDidUpdateValueForCharacteristicListener.remove();
      clearInterval(sendIntervalRef.current);
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
      BleManager.scan(scanOptions).then();
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
    setIsConnecting(true);

    BleManager.connect(device.id)
      .then(() => {
        setIsConnecting(false);

        setConnectedDevices((prev) => {
          if (prev.find((d) => d.id === device.id)) return prev;
          return [device, ...prev];
        });

        //Send initial set time packet
        let packet = new Packet();
        startDeviceNotify(device, packet.sendSetTime());
      })
      .catch((error) => {
        console.log(error);
        setIsConnecting(false);
      });
  };

  const disconnectDevice = (device: Peripheral) => {
    BleManager.disconnect(device.id)
      .then(() => {
        setConnectedDevices(connectedDevices.filter((d) => d.id !== device.id));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getConnectedDevices = () => {
    BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
      setConnectedDevices([...peripheralsArray]);
    });
  };

  const startDeviceNotify = (device: Peripheral, packet: Uint8Array) => {
    BleManager.retrieveServices(device.id).then((peripheralInfo) => {
      BleManager.startNotification(device.id, SERVICE_UUID, READ_CHAR)
        .then(() => {
          BleManager.write(device.id, SERVICE_UUID, WRITE_CHAR, [
            ...packet,
          ]).catch((err) => console.log("Write error:", err));
        })
        .catch((error) => {
          console.log(error);
        });
    });
  };

  const sendNewPacket = (deviceID: string, packet: Uint8Array) => {
    BleManager.write(deviceID, SERVICE_UUID, WRITE_CHAR, [...packet]).catch(
      (err) => console.log("Write error:", err),
    );
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
                </View>
              ))}
            </>
          )}
          {deviceList.length > 0 ? (
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
              {deviceList.sort((a, b) => b.rssi - a.rssi).map((device: Peripheral) => (
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
