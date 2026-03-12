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
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BleManager, { Peripheral } from "react-native-ble-manager";
import { Packet, PacketTypes } from "@/src/utils/Packet";
import { UnitDataContext } from "@/src/components/UnitDataProvider";
import { SettingsStore } from "@/src/hooks/useStorage";
import { useTheme } from "@react-navigation/native";
import { HbsDevice } from "@/src/types/hbsDevice";
import FoundDeviceCard from "@/src/components/FoundDeviceCard";
import ConnectedDeviceCard from "@/src/components/ConnectedDeviceCard";
import { PacketQueueContext } from "@/src/components/PacketQueue";

const SERVICE_UUID = "00001000-0000-1000-8000-00805f9b34fb";
const WRITE_CHAR = "00001001-0000-1000-8000-00805f9b34fb";
const READ_CHAR = "00001002-0000-1000-8000-00805f9b34fb";
const READ_DESC = "00002902-0000-1000-8000-00805f9b34fb";
const SCAN_DURATION = 5;

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
  const { unitData, setUnitData, setUnitImageURL, unitImageURL } =
    useContext(UnitDataContext);
    const {queuePacket} = useContext(PacketQueueContext);
  const [imageLink, setImageLink] = useState("");
  const sortedDevices = [...foundDeviceList].sort(
    (a, b) => b.device.rssi - a.device.rssi,
  );

  const theme = useTheme();
  const packet = new Packet();

  const initBLE = async () => {
    const permissionsGranted = await requestBLEPermissions();
    if (!permissionsGranted) {
      return;
    }
    await BleManager.start({ showAlert: true });
    getConnectedDevices();
    startScanningDevices();
  };

  useEffect(() => {
    initBLE();

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
      const storedName = await SettingsStore.getValueFor(
        deviceID.replaceAll(":", "-"),
      );
      return storedName ? storedName : "";
    } catch (error) {}
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
          .then((mtu) => {})
          .catch((error) => {
            console.log(error);
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

        //enqueue packet for writing. 
          queuePacket(packet);
        await BleManager.write(device.id, SERVICE_UUID, WRITE_CHAR, [
          ...packet,
        ]);
        currentQueuedPacket = packet;
      }
    } catch (error) {}
  };

  const sendNewPacket = async (deviceID: string, packet: Uint8Array) => {
    try {
      await BleManager.write(deviceID, SERVICE_UUID, WRITE_CHAR, [...packet]);
    } catch (error) {}
  };

  const handleResponsePacket = async (
    returnData: Uint8Array<any>,
    id: string,
  ) => {
    try {
      const parsedReturnData = await packet.parsePacket(returnData);
      let sendPacket = null;
      const { type, currentPacket, regData } = parsedReturnData;

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

            <ConnectedDeviceCard
              connectedDevice={connectedDevice}
              imageLink={imageLink}
              getSignalIcon={getSignalIcon(connectedDevice.device.rssi)}
              identifyUnit={() =>
                sendNewPacket(
                  connectedDevice.device.id,
                  packet.sendIdentifyUnit(),
                )
              }
              stopIdentifyUnit={() =>
                sendNewPacket(
                  connectedDevice.device.id,
                  packet.sendStopIdentifyUnit(),
                )
              }
              disconnectDevice={() => disconnectDevice(connectedDevice.device)}
            ></ConnectedDeviceCard>
          </>
        )}
        {sortedDevices.length > 0 ? (
          <>
            {/* Title */}
            <View
              style={{
                alignSelf: "flex-start",
                marginBottom: 2,
                marginTop: 10,
              }}
            >
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
            {sortedDevices.map((item: HbsDevice, index) => (
              <FoundDeviceCard
                key={index}
                peripheral={item}
                connectToDevice={() => connectToDevice(item.device)}
                getSignalIcon={getSignalIcon(item.device.rssi)}
              ></FoundDeviceCard>
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
});
