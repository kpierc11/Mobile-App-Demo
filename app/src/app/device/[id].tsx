import { UnitDataContext } from "@/src/components/UnitDataProvider";
import { useLocalSearchParams, router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as Progress from "react-native-progress";
import Feather from "@expo/vector-icons/Feather";
import { SettingsStore } from "@/src/hooks/useStorage";

export default function DeviceDetails() {
  const { deviceDetails } = useLocalSearchParams();
  const { unitData } = useContext(UnitDataContext);
  const [storedDeviceName, setStoredDeviceName] = useState("");

  const parsedDetails = deviceDetails
    ? JSON.parse(deviceDetails as string)
    : {};

  const { name, id } = parsedDetails;

  const getStoredDeviceName = async () => {
    try {
      const storedName = await SettingsStore.getValueFor(name);

      return storedName;
    } catch (error) {
      console.log(error);
    }
  };

  if (!deviceDetails) {
    return <Text>No device data available.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <Image
        source={require("../../../assets/images/hbs-splash.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.settingsCard}>
        <View style={styles.iconMainContainer}>
          {/* Device Name */}
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() =>
              router.push({
                pathname: "/device/edit-alias",
                params: { currentDeviceID: id },
              })
            }
          >
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{storedDeviceName || name}</Text>
            </View>
            <Feather name="edit" size={18} color="black" />
          </TouchableOpacity>

          {/* Device ID */}
          <View style={styles.iconContainer}>
            <Text style={styles.label}>ID:</Text>
            <Text style={styles.value}>{id}</Text>
          </View>
        </View>
      </View>

      {/* Device Registers */}
      <View style={styles.cardWrapper}>
        {unitData.length > 0 ? (
          unitData.map(({ registerName, value }) => (
            <View key={registerName} style={styles.card}>
              {value === "Enabled" && <View style={styles.statusEnabled} />}
              {value === "Disabled" && <View style={styles.statusDisabled} />}

              {registerName.includes("Voltage") && (
                <Progress.Bar progress={0.8} width={100} />
              )}

              <Text style={styles.subHeading}>{registerName}</Text>
              <Text style={styles.deviceInfoText}>{value}</Text>
            </View>
          ))
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Device Data...</Text>
            <ActivityIndicator size="large" />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },

  image: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },

  settingsCard: {
    width: "auto",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 20,
    marginBottom: 20,
  },

  iconMainContainer: {
    gap: 30,
    width: "100%",
    paddingVertical: 10,
  },

  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },

  value: {
    fontSize: 16,
    color: "black",
  },

  cardWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  card: {
    flexBasis: "48%",
    margin: "1%",
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
    maxHeight: 250,
  },

  subHeading: {
    fontSize: 16,
    marginTop: 10,
  },

  deviceInfoText: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: "500",
  },

  statusEnabled: {
    backgroundColor: "#8FBC8B",
    borderRadius: 99,
    width: 15,
    height: 15,
  },

  statusDisabled: {
    backgroundColor: "#CD5C5C",
    borderRadius: 99,
    width: 15,
    height: 15,
  },

  loadingContainer: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 18,
  },
});
