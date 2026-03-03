import { UnitDataContext } from "@/components/UnitDataProvider";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { SettingsStore } from "@/hooks/use-storage";

export default function EditAlias() {
  const { deviceDetails } = useLocalSearchParams();
  const [deviceName, setDeviceName] = useState("");

  const parsedDetails = deviceDetails
    ? JSON.parse(deviceDetails as string)
    : {};

    console.log(deviceDetails);
  const {currentDeviceID } = parsedDetails;

  console.log(currentDeviceID);

  const getSavedName = async () => {
    try {
      const savedName = await SettingsStore.getValueFor(currentDeviceID);

      if (savedName) {
        setDeviceName(savedName);
      }
      else {
        SettingsStore.save(currentDeviceID, deviceName);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSavedName();
  }, [deviceName]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.settingsCard}>
        <TextInput
          style={styles.input}
          onChangeText={setDeviceName}
          value={deviceName}
          placeholderTextColor={"#C2C2C2"}
          placeholder={"Device Name..."}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  settingsCard: {
    display: "flex",
    justifyContent: "center",
    borderColor: "black",
    width: "100%",
    borderWidth: 0,
    padding: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  input: {
    height: 40,
    margin: 2,
    width: 200,
    fontSize: 16,
    borderRadius: 10,
    padding: 10,
  },
});
