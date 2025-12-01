import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Button,
  StatusBar,
  ActivityIndicator,
  Platform,
  Alert,
  Linking,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import BleManager, { Peripheral } from "react-native-ble-manager";
import { Buffer } from 'buffer';
import ModalScreen from "../modal";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Link } from "expo-router";



interface ConnectedDevices {
  device: Peripheral;
  isConnected: boolean;
}

const deviceUUID = '00001000-0000-1000-8000-00805f9b34fb';
const scanTime = 7;

export default function HomeScreen() {
  const [deviceList, setDeviceList] = useState<Peripheral[]>([]);
  const [restartScan, setRestartScan] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [connectedDeviceData, setConnectedDeviceData] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<Peripheral[]>([]);

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

        console.log("found device");
        console.log(`Device Id: ${id}`);
        console.log(`Device Name: ${name ?? "Unknown"}`);
        console.log(`Device is connectable: ${isConnectable}`);
        const match = serviceUUIDs?.find(
          uuid => uuid.toLowerCase().includes('1000')
        );

        console.log(`Matched Service UUID: ${match}`);

        if (rssi > -85 && isConnectable && name?.toLowerCase() != "unknown") {
          setDeviceList(prev => {
            // Avoid duplicates
            if (prev.find((p) => p.id === peripheral.id)) return prev;

            return [peripheral, ...prev];
          });
        }


      }
    );

    return () => {
      onStopListener.remove();
      onDiscoveredPeripheralListener.remove();
    };
  }, []);


  const startScanningDevices = () => {

    if (!isScanning) {
      setIsScanning(true);
      const scanOptions = { serviceUUIDs: [], seconds: scanTime, allowDuplicates: false };
      BleManager.scan(scanOptions).then(() => {
        // Success code
        console.log(scanOptions);
        console.log("Scan started");
      });
    }

  }


  const connectToDevice = (device: Peripheral) => {
    console.log("Trying to connect to device.");
    setIsConnecting(true);
    BleManager.connect(device.id).then(() => {
      console.log("connected to device!");
      setIsConnecting(false);
      setConnectedDevices(prev => {
        if (prev.find(d => d.id === device.id)) return prev;
        return [device, ...prev];
      });
      readDeviceData(device);

    }).catch((error) => {
      console.log(error);
    });
  }


  const disconnectDevice = (device: Peripheral) => {
    console.log("Disconnected device.");
    BleManager.disconnect(device.id).then(() => {
      console.log("disconnected device!");
      setConnectedDevices(connectedDevices.filter(d =>
        d.id !== device.id
      ))
    }).catch((error) => {
      console.log(error);
    });
  }

  const getConnectedDevices = () => {

    BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
      // Success code
      console.log("Connected peripherals: " + peripheralsArray.length);

      setConnectedDevices(peripheralsArray)
    });
  }


  const readDeviceData = (device: Peripheral) => {

    BleManager.retrieveServices(device.id)
      .then((peripheralInfo) => {
        console.log("Peripheral info:", peripheralInfo);

        peripheralInfo.characteristics?.forEach((char) => {
          if (char.descriptors && char.descriptors.length > 0) {
            char.descriptors.forEach((descript) => {
              if (descript.uuid) {
                // Read the descriptor value
                BleManager.readDescriptor(
                  device.id,
                  char.service,
                  char.characteristic,
                  descript.uuid
                )
                  .then((readData) => {
                    // Convert bytes to string
                    const buffer = Buffer.from(readData);
                    const text = buffer.toString("utf8");
                    console.log(
                      `Characteristic: ${char.characteristic}, Service: ${char.service}, Descriptor: ${descript.uuid}, Value: ${text}`
                    );
                  })
                  .catch((err) => {
                    console.log(
                      `Failed to read descriptor ${descript.uuid} of characteristic ${char.characteristic}:`,
                      err
                    );
                  });
              } else {
                console.log(
                  `Skipping descriptor with no UUID for characteristic ${char.characteristic}`
                );
              }
            });
          }
        });


        BleManager.read(device.id, "180a", "2a25").then((readData) => {
          console.log("Read: " + readData);

          // https://github.com/feross/buffer
          // https://nodejs.org/api/buffer.html#static-method-bufferfromarray
          const buffer = Buffer.from(readData);
          const text = buffer.toString("utf8");
          console.log(text);
          setConnectedDeviceData(text);

        })
          .catch((err) => console.log("Read error:", err));;

        //return BleManager.readDescriptor(device.id, "1000", "1002", "2901");

        //Possible temp reading
        //return BleManager.read(device.id, "180a", "2a24");

        //Date
        //return BleManager.read(device.id, "180a", "2a25");

        //Version Number
        //return BleManager.read(device.id, "180a", "2a26");

        //Device Name
        //return BleManager.read(device.id, "180a", "2a27");

        //Some Website
        //return BleManager.read(device.id, "180a", "2a29");

        //experimental
        //return BleManager.read(device.id, "180a", "2a2a");

        //Not sure
        //return BleManager.read(device.id, "180a", "2a50");

        //Not sure
        //return BleManager.read(device.id, "1000", "1005");

        // return BleManager.read(device.id, "f000ffd0-0451-4000-b000-000000000000",
        //   "f000ffd1-0451-4000-b000-000000000000");


      })
  }


  const handleDeviceListRefresh = () => {

    setTimeout(() => {
      startScanningDevices();
    }, 800);
  }


  if (isScanning) {
    return (
      <SafeAreaView style={{ flex: 1, }}>

        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <Text style={{ textAlign: "center", marginTop: 20 }}>Scanning for Devices:</Text>
          <ActivityIndicator style={{ marginTop: 20 }} size="large" />
        </View>
      </SafeAreaView>
    )
  }

  if (isConnecting) {
    return (
      <ModalScreen text="Attempting to connect to device..." />
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <Text style={styles.deviceTitle}>HBS Devices</Text>
        <ScrollView contentContainerStyle={styles.scrollView} refreshControl={
          <RefreshControl refreshing={isScanning} onRefresh={handleDeviceListRefresh} />
        }>
          <View style={{ display: "flex", alignSelf: "flex-start" }}>
            <Text style={styles.subHeading}>Connected Devices</Text>
          </View>
          {connectedDevices.length > 0 ?
            connectedDevices.map((device: Peripheral, index) => (
              <View key={index} style={styles.card}>
                <Text>Device ID:{device.id}</Text>
                <Text>
                  Device Name:
                  {device.name ?? "Unknown"}
                </Text>
                <Text>
                  Device rssi:
                  {device.rssi ?? "Unknown"}
                </Text>
                <View style={{ display: "flex", flexDirection: "row", gap: 5, marginTop: 20 }}>
                  <View style={{ display: "flex", flexDirection: "row", gap: 5, marginRight: "auto", alignItems: "center" }}>
                    <Link
                      href={{
                        pathname: "/[deviceDetails]",
                        params: {
                          deviceDetails: JSON.stringify(device),
                        },
                      }}
                    >
                      Go to Details
                    </Link>
                    <MaterialCommunityIcons name="bluetooth-connect" size={28} color="#215387" onPress={() => connectToDevice(device)} />
                  </View>
                  <AntDesign name="database" size={24} color="#215387" onPress={() => readDeviceData(device)} />
                  <AntDesign name="disconnect" size={28} color="#215387" onPress={() => disconnectDevice(device)} />
                </View>
                <View>
                  <Text>{connectedDeviceData}</Text>
                </View>
              </View>
            )) : (<></>)}
          <View style={{ display: "flex", alignSelf: "flex-start" }}>
            <Text style={styles.subHeading}>Found Devices</Text>
          </View>
          {deviceList.length > 0 ?
            deviceList.map((device: Peripheral, index) => (
              <View key={index} style={styles.card}>
                <Text>Device ID:{device.id}</Text>
                <Text>
                  Device Name:
                  {device.name ?? "Unknown"}
                </Text>
                <Text>
                  Device rssi:
                  {device.rssi ?? "Unknown"}
                </Text>
                <View style={styles.ctaButton}>
                  <Button title="Connect Device" color="white" onPress={() => connectToDevice(device)}></Button>
                </View>
                <View>
                  <Text>{connectedDeviceData}</Text>
                </View>
              </View>
            )) : (
              <View style={{ display: "flex", alignSelf: "flex-start" }}>
                <Text >No devices found.</Text>
                <Text >Pull down to scan for devices.</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },

  deviceTitle: {
    fontSize: 25,
    fontWeight: "400",
    textAlign: "center",
    color: "black",
  },

  subHeading: {
    fontSize: 20,
    fontWeight: "400",
    textAlign: "center",
    color: "black",
    marginBottom: 20,
  },

  ctaButton: {
    backgroundColor: "#215387",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 5,
    marginBottom: 5,
    borderRadius: 8,
    marginTop: 5,
    display: "flex",
    flexDirection: "row",
    gap: 5,
    padding: 5
  },
  ctaButtonText: {
    fontSize: 18,
    color: "white",
  },

  card: {
    borderColor: "black",
    borderWidth: 0,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android
    borderRadius: 10,
    marginLeft: 5,
    marginRight: 5,
  },
  button: {
    backgroundColor: "#215387",
  }
});
