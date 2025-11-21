import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
  Button,
  StatusBar,
  PermissionsAndroid,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import BleManager, { Peripheral } from "react-native-ble-manager";
import { getCustomTabsSupportingBrowsersAsync } from "expo-web-browser";

export default function HomeScreen() {
  const [bleInit, setBleInit] = useState<boolean>(false);
  const [deviceInfo, setDeviceInfo] = useState<Peripheral[]>([]);
  const [restartScan, setRestartScan] = useState<boolean>(false);

  //initialize bluetooth manager
  useEffect(() => {
    BleManager.start({ showAlert: true }).then(() => {
      console.log("BLE initialized");

      //Start Scan
      const scanOptions = { seconds: 5, allowDuplicates: false };
      BleManager.scan(scanOptions).then(() => {
        // Success code
        console.log(scanOptions);
        console.log("Scan started");
      });
    });

    BleManager.isStarted().then((started) => {
      setBleInit(true);
      console.log(`Module is ${started ? "" : "not "}started`);
    });

    const onStopListener = BleManager.onStopScan(() => {
      console.log("scan finished");
      setRestartScan(false);
    });

    const onDiscoveredPeripheralListener = BleManager.onDiscoverPeripheral(
      (peripheral: Peripheral) => {
        const { id, name } = peripheral;

        console.log("found device");
        console.log(`Device Id: ${id}`);
        console.log(`Device Name: ${name ?? "Unknown"}`);

        setDeviceInfo((prev) => {
          // const exists = prev.some((p) => p.id === peripheral.id);

          return [...prev, peripheral];
        });
      }
    );

    return () => {
      onStopListener.remove();
      onDiscoveredPeripheralListener.remove();
    };
  }, [restartScan]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar
        translucent={false} // ensures content starts below the status bar
        barStyle="dark-content"
        backgroundColor="white" // match SafeAreaView
      />
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <Text style={styles.heartRateText}>Devices Bitch.</Text>
        <ScrollView style={{ flex: 1, marginTop: 15 }}>
          {deviceInfo.length > 0 &&
            deviceInfo.map((device) => (
              <View key={device.id} style={{ marginBottom: 12 }}>
                <Text style={{ color: "black" }}>{device.id}</Text>
                <Text style={{ color: "black" }}>
                  {device.name ?? "Unknown"}
                </Text>
              </View>
            ))}
        </ScrollView>
        <View style={styles.ctaButton}>
          <Button
            title="Rescan Devices"
            onPress={() => {
              setDeviceInfo([]);
              setRestartScan(true);
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#6495ED",
    paddingTop: StatusBar.currentHeight,
    borderTopWidth: 2,
    borderTopColor: "black",
  },
  heartRateTitleWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heartRateTitleText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 20,
    color: "black",
  },
  heartRateText: {
    fontSize: 25,
    marginTop: 15,
  },
  ctaButton: {
    backgroundColor: "#6495ED",
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
});
