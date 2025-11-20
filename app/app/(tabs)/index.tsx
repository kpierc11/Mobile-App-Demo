import { Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BleManager from 'react-native-ble-manager';

export default function HomeScreen() {

  const [bleInit, setBleInit] = useState<boolean>(false);

  //initialize bluetooth manager
  useEffect(() => {
    BleManager.start({ showAlert: true });

    BleManager.isStarted().then((started) => {
      setBleInit(true);
      console.log(`Module is ${started ? '' : 'not '}started`);
    });

    const onStopListener = BleManager.onStopScan((args) => {
      console.log("scan finished");
      BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
        // Success code
        console.log("Connected peripherals: " + peripheralsArray.length);
      });
    })

    return () => {
      onStopListener.remove();
    };
  }, [])


  if (bleInit) {
    const scanOptions = {seconds:5};
    BleManager.scan(scanOptions).then(() => {
      // Success code
      console.log(scanOptions);
      console.log("Scan started");
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heartRateText}>Content is in safe area.</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
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
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});

