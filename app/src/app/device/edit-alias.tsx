import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SettingsStore } from "@/src/hooks/useStorage";
import { useTheme } from "@react-navigation/native";
import { Packet } from "@/src/utils/Packet";
import { PacketQueueContext } from "@/src/components/PacketQueue";

export default function EditAlias() {
  const theme = useTheme();
  const { currentDeviceID, currentDeviceName } = useLocalSearchParams();
  const [deviceName, setDeviceName] = useState(currentDeviceName);
  const { processImmediatePacket } = useContext(PacketQueueContext);
  const packetParser = new Packet();

  const formattedDeviceID = currentDeviceID.toString().replaceAll(":", "-");

  const getSavedName = async () => {
    try {
      const savedName = await SettingsStore.getValueFor(formattedDeviceID);

      if (savedName) {
        setDeviceName(savedName);
      }
    } catch (error) {}
  };

  const saveNewName = async () => {
    const testArray = new Uint8Array([-78, -62, 28, 0, 0, 0, -1, 31, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 115, 23, 16, 104, 101, 108, 108, 111, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -95]);
    
    try {
      await SettingsStore.save(formattedDeviceID, deviceName.toString());
      await processImmediatePacket(
        testArray,
        currentDeviceID.toString(),
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSavedName();
  }, []);

  useEffect(() => {
    if (deviceName !== currentDeviceName) {
      saveNewName();
    }
  }, [deviceName]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[styles.settingsCard, { backgroundColor: theme.colors.card }]}
      >
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          onChangeText={setDeviceName}
          value={deviceName.toString()}
          placeholder={"Device Name..."}
          placeholderTextColor={theme.colors.border}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingsCard: {
    display: "flex",
    justifyContent: "center",
    borderColor: "black",
    width: "100%",
    borderWidth: 0,
    padding: 1,
    borderRadius: 10,
  },
  input: {
    height: 40,
    margin: 2,
    width: "100%",
    fontSize: 16,
    borderRadius: 10,
    padding: 10,
  },
});
