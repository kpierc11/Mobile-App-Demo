import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SettingsStore } from "@/src/hooks/useStorage";
import { useTheme } from "@react-navigation/native";

export default function EditAlias() {
  const theme = useTheme();
  const { currentDeviceID, currentDeviceName } = useLocalSearchParams();
  const [deviceName, setDeviceName] = useState(currentDeviceName);

  const getSavedName = async () => {
    try {
      const savedName = await SettingsStore.getValueFor(
        currentDeviceID.toString(),
      );

      if (savedName) {
        setDeviceName(savedName);
      }
    } catch (error) {
    }
  };

  const saveNewName = async () => {
    try {
      await SettingsStore.save(
        currentDeviceID.toString(),
        deviceName.toString(),
      );
    } catch (error) {
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
