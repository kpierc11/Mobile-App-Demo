import { Platform,  StyleSheet, TouchableOpacity, View } from 'react-native';

import useBLE from '@/hooks/use-ble';
import React, { useState } from 'react';
import DeviceModal from './deviceConnectionModal';

export default function HomeScreen() {
   const {
    allDevices,
    connectedDevice,
    connectToDevice,
    color,
    requestPermissions,
    scanForPeripherals,
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };
  return (

    <View style={[styles.container, { backgroundColor: color }]}>
      <View style={styles.heartRateTitleWrapper}>
        {connectedDevice ? (
          <>
            <p style={styles.heartRateTitleText}>Connected</p>
          </>
        ) : (
          <p style={styles.heartRateTitleText}>
            Please connect the Arduino
          </p>
        )}
      </View>
      <TouchableOpacity onPress={openModal} style={styles.ctaButton}>
        <p style={styles.ctaButtonText}>Connect</p>
      </TouchableOpacity>
      { <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      /> }
    </View>
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

