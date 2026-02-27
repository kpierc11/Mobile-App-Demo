import AliasModalScreen from "@/components/alias-modal";
import { UnitDataContext } from "@/components/UnitDataProvider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Pressable,
  Alert,
  Modal,
  TextInput,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { storage } from "../_layout";
import { NavigationMetaContext } from "@react-navigation/native";

export default function EditAlias() {
  const { currentDeviceID } = useLocalSearchParams();
  const { unitData, unitImageURL } = useContext(UnitDataContext);
  const [deviceName, setDeviceName] = useState("");

  const deviceMacName: string = currentDeviceID.toString();

  const storeDeviceName = async () => {
    try {
      await storage.setItem(deviceMacName, deviceName);
    } catch (error) {
      console.log(error);
    }
  };

  const getStoredDeviceName = async () => {
    const storedName = await storage.getItem(deviceMacName);
    if (!storedName) {
      return "";
    }
    return storedName;
  };

  useEffect(() => {
    getStoredDeviceName().then((storedDeviceName) => {
      setDeviceName(storedDeviceName);
    });
  }, []);

  useEffect(() => {
    storeDeviceName();
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
        {/* <Pressable
          style={[styles.button, styles.buttonClose]}
          onPress={() => handleModalSubmit}
        >
          <Text style={styles.textStyle}>Set Alias</Text>
        </Pressable> */}
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
