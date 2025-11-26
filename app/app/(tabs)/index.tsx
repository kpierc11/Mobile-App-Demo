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

const deviceUUID = '00001000-0000-1000-8000-00805f9b34fb';

export default function HomeScreen() {
  const [deviceList, setDeviceList] = useState<Peripheral[]>([]);
  const [restartScan, setRestartScan] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  //initialize bluetooth manager
  useEffect(() => {
    BleManager.start({ showAlert: true }).then(() => {
      console.log("BLE initialized");
      startScanningDevices();
    });

    const onStopListener = BleManager.onStopScan(() => {
      console.log("scan finished");
      setRestartScan(false);
      setIsScanning(false);
    });

    const onDiscoveredPeripheralListener = BleManager.onDiscoverPeripheral(
      (peripheral: Peripheral) => {
        const { id, name, advertising } = peripheral;
        const { isConnectable, serviceUUIDs } = advertising;

        console.log("found device");
        console.log(`Device Id: ${id}`);
        console.log(`Device Name: ${name ?? "Unknown"}`);
        console.log(`Device is connectable: ${isConnectable}`);
        const match = serviceUUIDs?.find(
          uuid => uuid.toLowerCase().includes('1000')
        );

        console.log(`Matched Service UUID: ${match}`);

        if (match) {
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
      const scanOptions = { serviceUUIDs: [], seconds: 10, allowDuplicates: false };
      BleManager.scan(scanOptions).then(() => {
        // Success code
        console.log(scanOptions);
        console.log("Scan started");
      });
    }

  }


  const connectToDevice = (device: Peripheral) => {
    console.log("Trying to connect to device.");
    BleManager.connect(device.id).then(() => {
      console.log("connected to device!");
      readDeviceData(device);

    }).catch((error) => {
      console.log(error);
    });
  }


  const readDeviceData = (device: Peripheral) => {

    BleManager.retrieveServices(device.id)
      .then((peripheralInfo) => {
        console.log("Peripheral info:", peripheralInfo);
        //Possible temp reading
        return BleManager.read(device.id, "180a", "2a24");

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

      })
      .then((readData) => {
        if (!readData || readData.length === 0) {
          console.log("No data received");
          return;
        }

        console.log("Raw Read (bytes):", readData);

        const uint8Array = new Uint8Array(readData);
        const decoder = new TextDecoder('utf-8');
        const decodedString = decoder.decode(uint8Array);

        console.log("Decoded String:", decodedString);
      })
      .catch((err) => {
        console.log("Read error:", err);
      });
  }


  const handleDeviceListRefresh = () => {

    setTimeout(() => {
      startScanningDevices();
    }, 800);
  }


  if (isScanning) {
    return (
      <SafeAreaView style={{ flex: 1, }}>
        <Text style={styles.deviceTitle}>HBS Devices</Text>
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <Text style={{ textAlign: "center", marginTop: 20 }}>Scanning for Devices:</Text>
          <ActivityIndicator style={{ marginTop: 20 }} size="large" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <Text style={styles.deviceTitle}>HBS Devices</Text>
        <ScrollView contentContainerStyle={styles.scrollView} refreshControl={
          <RefreshControl refreshing={isScanning} onRefresh={handleDeviceListRefresh} />
        }>
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
                <Button title="Connect Device" onPress={() => connectToDevice(device)}></Button>
              </View>
            )) : (
              <View>
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

  ctaButton: {
    backgroundColor: "#215387",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
    marginTop: 20,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
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
  }
});
