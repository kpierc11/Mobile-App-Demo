import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  PermissionsAndroid,
  Platform,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BleManager, { Peripheral } from "react-native-ble-manager";
import { Packet } from "@/src/utils/Packet";
import { UnitDataContext } from "@/src/components/UnitDataProvider";
import { SettingsStore } from "@/src/hooks/useStorage";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import { HbsDevice } from "@/src/types/hbsDevice";
import FoundDeviceCard from "@/src/components/FoundDeviceCard";
import ConnectedDeviceCard from "@/src/components/ConnectedDeviceCard";
import { PacketQueueContext } from "@/src/components/PacketQueue";
import { BLE_CONFIG } from "@/src/constants/bleConfig";
import FilterOptions from "@/src/components/FilterOptions";

export default function HomeScreen() {
  const [foundDeviceList, setFoundDeviceList] = useState<HbsDevice[]>([]);
  const [restartScan, setRestartScan] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<HbsDevice>();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterAlphabetically, setFilterAlphabetically] =
    useState<boolean>(false);
  const { setUnitData } = useContext(UnitDataContext);
  const { processResponsePacket, processImmediatePacket } =
    useContext(PacketQueueContext);
  const [aliasUpdated, setAliasUpdated] = useState<boolean>(false);
  const [imageLink, setImageLink] = useState("");

  const getStoredDeviceName = async (deviceID: string) => {
    try {
      const storedName = await SettingsStore.getValueFor(
        deviceID.replaceAll(":", "-"),
      );
      return storedName ? storedName : "";
    } catch (error) {}
  };

  const sortedDevices = foundDeviceList
    .filter((a) => {
      if (searchTerm != "" && a.device.name) {
        const nameA = a.storedDeviceName.toUpperCase()
          ? a.storedDeviceName.toUpperCase()
          : a.device.name.toUpperCase();
        return nameA.includes(searchTerm.toUpperCase());
      }
      return a;
    })
    .sort((a, b) => {
      if (filterAlphabetically && a.device.name && b.device.name) {
        const nameA = a.storedDeviceName.toUpperCase()
          ? a.storedDeviceName.toUpperCase()
          : a.device.name;
        const nameB = b.storedDeviceName.toUpperCase()
          ? b.storedDeviceName.toUpperCase()
          : b.device.name;

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      }
      return b.device.rssi - a.device.rssi;
    });

  const theme = useTheme();
  const packet = new Packet();

  const initBLE = async () => {
    const permissionsGranted = await requestBLEPermissions();
    if (!permissionsGranted) {
      return;
    }
    await BleManager.start({ showAlert: true });
    await startScanningDevices();
  };

  useEffect(() => {
    getDiscoveredDevices();
  } );

  useEffect(() => {
    initBLE();

    const stateListener = BleManager.onDidUpdateState((args: any) => {
      if (args.state === "on") {
        setTimeout(() => {
          startScanningDevices();
        }, 300);
      }
    });

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
                {
                  device: peripheral,
                  storedDeviceName: storedName || "",
                  imageLink: "",
                },
              ];
            });
          });
        }
      },
    );

    const onDisconnectPeripheralListener = BleManager.onDisconnectPeripheral(
      ({ peripheral }) => {},
    );

    const onConnectPeripheralListener = BleManager.onConnectPeripheral(
      ({ peripheral }) => {},
    );

    const onDidUpdateValueForCharacteristicListener =
      BleManager.onDidUpdateValueForCharacteristic(({ value }: any) => {
        const returnData = new Uint8Array(value);
        processResponsePacket(returnData);
      });

    return () => {
      stateListener.remove();
      onStopListener.remove();
      onDiscoveredPeripheralListener.remove();
      onDisconnectPeripheralListener.remove();
      onDidUpdateValueForCharacteristicListener.remove();
      onConnectPeripheralListener.remove();
    };
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

  const startScanningDevices = async () => {
    setIsScanning(true);
    try {
      const scanOptions = {
        serviceUUIDs: [],
        seconds: BLE_CONFIG.SCAN_DURATION,
      };
      await BleManager.scan(scanOptions);
      await new Promise((r) => {
        setTimeout(r, 3000);
      });
    } catch (error) {
    } finally {
      setIsScanning(false);
    }
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
          .then((mtu) => {})
          .catch((error) => {
            console.error(error);
          });
      }

      const storedDeviceName = await getStoredDeviceName(device.id);

      let storedName = "";

      if (storedDeviceName) {
        storedName = storedDeviceName;
      }

      setConnectedDevice({
        device: device,
        storedDeviceName: storedName,
        imageLink: imageLink,
      });

      startDeviceNotify(device, packet.sendSetTime());
    } catch (error) {
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectDevice = async (device: Peripheral) => {
    const CONNECTION_TIMEOUT = 6000;
    try {
      try {
        await BleManager.stopNotification(
          device.id,
          BLE_CONFIG.SERVICE_UUID,
          BLE_CONFIG.WRITE_CHAR,
        );
      } catch (e) {
        console.error("Notification was not active");
      }

      await Promise.race([
        BleManager.disconnect(device.id),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Connection timed out")),
            CONNECTION_TIMEOUT,
          ),
        ),
      ]);

      setImageLink("");
      setUnitData([]);

      setConnectedDevice(undefined);
    } catch (error) {
      console.error(error);
    }
  };

  const getDiscoveredDevices = async () => {
    try {
      const peripherals = await BleManager.getDiscoveredPeripherals();

      peripherals.forEach((peripheral) => {
        if (peripheral.name?.toLowerCase().includes("ble#")) {
          getStoredDeviceName(peripheral.id).then((storedName) => {
            setFoundDeviceList((prev) => {
              const exists = prev.some(
                (item) => item.device.id === peripheral.id,
              );
              if (exists) return prev;

              return [
                ...prev,
                {
                  device: peripheral,
                  storedDeviceName: storedName || "",
                  imageLink: "",
                },
              ];
            });
          });
        }
      });
    } catch (error) {}
  };

  const startDeviceNotify = async (device: Peripheral, packet: Uint8Array) => {
    try {
      const services = await BleManager.retrieveServices(device.id);
      if (services) {
        await BleManager.startNotification(
          device.id,
          BLE_CONFIG.SERVICE_UUID,
          BLE_CONFIG.READ_CHAR,
        );

        processImmediatePacket(packet, device.id);
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

      <View style={{ maxWidth: 800 }}>
        <FilterOptions
          filterAlphabetically={filterAlphabetically}
          setFilterAphabetically={() => {
            setFilterAlphabetically((prev) => !prev);
          }}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        ></FilterOptions>
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
              <View
                style={[styles.labelHeading, { backgroundColor: "#215387" }]}
              >
                <Text style={[styles.labelHeadingText, { color: "white" }]}>
                  Connected Device
                </Text>
              </View>

              <ConnectedDeviceCard
                connectedDevice={connectedDevice}
                imageLink={imageLink}
                getSignalIcon={getSignalIcon(connectedDevice.device.rssi)}
                identifyUnit={() =>
                  processImmediatePacket(
                    packet.sendIdentifyUnit(),
                    connectedDevice.device.id,
                  )
                }
                stopIdentifyUnit={() =>
                  processImmediatePacket(
                    packet.sendStopIdentifyUnit(),
                    connectedDevice.device.id,
                  )
                }
                disconnectDevice={() =>
                  disconnectDevice(connectedDevice.device)
                }
              ></ConnectedDeviceCard>
            </>
          )}
          {foundDeviceList.length > 0 ? (
            <>
              <View
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={[
                    styles.labelHeading,
                    { backgroundColor: "#215387", marginRight: "auto" },
                  ]}
                >
                  <Text style={[styles.labelHeadingText, { color: "white" }]}>
                    Found Devices
                  </Text>
                </View>
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
              {sortedDevices.map((item: HbsDevice, index) => (
                <FoundDeviceCard
                  key={index}
                  peripheral={item}
                  connectToDevice={() => connectToDevice(item.device)}
                  identifyUnit={() =>
                    processImmediatePacket(
                      packet.sendIdentifyUnit(),
                      item.device.id,
                    )
                  }
                  stopIdentifyUnit={() =>
                    processImmediatePacket(
                      packet.sendStopIdentifyUnit(),
                      item.device.id,
                    )
                  }
                  getSignalIcon={getSignalIcon(item.device.rssi)}
                  setAliasUpdated={() => setAliasUpdated(true)}
                ></FoundDeviceCard>
              ))}
            </>
          ) : (
            <></>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    alignItems: "center",
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
    width: "100%",
    fontWeight: "bold",
    textAlign: "left",
    color: "black",
  },

  labelHeading: {
    justifyContent: "center",
    alignSelf: "flex-start",
    borderRadius: 99,
    padding: 8,
    marginBottom: 10,
    marginTop: 20,
  },

  labelHeadingText: {
    fontWeight: "400",
    fontSize: 12,
  },

  subHeading: {
    fontSize: 18,
    fontWeight: "400",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
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
});
