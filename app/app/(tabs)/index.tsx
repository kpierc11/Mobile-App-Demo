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
import { useTheme } from "@react-navigation/native";


export default function HomeScreen() {
  const [deviceInfo, setDeviceInfo] = useState<Peripheral[]>([]);
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
        const { id, name } = peripheral;

        console.log("found device");
        console.log(`Device Id: ${id}`);
        console.log(`Device Name: ${name ?? "Unknown"}`);

        setDeviceInfo((prev): any => {
          // const exists = prev.some((p) => p.id === peripheral.id);

          return [...prev, peripheral];
        });
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
      const scanOptions = { seconds: 5, allowDuplicates: false };
      BleManager.scan(scanOptions).then(() => {
        // Success code
        console.log(scanOptions);
        console.log("Scan started");
      });
    }

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
          {deviceInfo.length > 0 ?
            deviceInfo.map((device, index) => (
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
