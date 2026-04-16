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
import { useTheme } from "@react-navigation/native";
import { Packet } from "@/src/utils/Packet";

const imageMap: Record<number, any> = {
  24: require("../../../assets/images/devices/solar-controller.png"),
  25: require("../../../assets/images/devices/ac-power-supply.png"),
  40: require("../../../assets/images/devices/24-volt-ac-dc-power.png"),
};

export default function DeviceDetails() {
  const theme = useTheme();
  const { deviceDetails } = useLocalSearchParams();
  const { unitData, unitHID } = useContext(UnitDataContext);
  const [storedDeviceName, setStoredDeviceName] = useState("");
  const packetParser = new Packet();
  const parsedDetails = deviceDetails
    ? JSON.parse(deviceDetails as string)
    : {};

  const { name, id} = parsedDetails;

  const getStoredDeviceName = async () => {
    try {
      const storedName = await SettingsStore.getValueFor(
        id.replaceAll(":", "-"),
      );
      if (storedName) {
        setStoredDeviceName(storedName);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getStoredDeviceName();
  },[]);

  if (!deviceDetails) {
    return (
      <Text style={{ color: theme.colors.text }}>
        No device data available.
      </Text>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollView,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Image
        source={imageMap[unitHID]}
        style={styles.image}
        resizeMode="cover"
      />

      <View
        style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}
      >
        <Text style={[styles.mainHeading, { color: theme.colors.text }]}>
          Device Properties
        </Text>
      </View>
      <View
        style={[styles.settingsCard, { backgroundColor: theme.colors.card }]}
      >
        <View style={styles.iconMainContainer}>
          {/* Device Name */}
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() =>
              router.push({
                pathname: "/device/edit-alias",
                params: { currentDeviceID: id, currentDeviceName: name },
              })
            }
          >
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Alias:
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {storedDeviceName ? storedDeviceName : name}
              </Text>
            </View>
            <Feather name="edit" size={18} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.iconContainer}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                ID:
              </Text>
              <Text
                style={[
                  styles.value,
                  { color: theme.colors.text, maxWidth: 200 },
                ]}
              >
                {id}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() =>
              router.push({
                pathname: "/device/quattro-scheduler",
                params: { currentDeviceID: id, currentDeviceName: name },
              })
            }
          >
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Quattro Scheduler
              </Text>
            </View>
            <Feather name="settings" size={18} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}
      >
        <Text style={[styles.mainHeading, { color: theme.colors.text }]}>
          Sensor Readings
        </Text>
      </View>
      {/* Device Registers */}
      <View style={styles.cardWrapper}>
        {unitData.length > 0 ? (
          unitData.map(({ registerName, value }) => (
            <View
              key={registerName}
              style={[styles.card, { backgroundColor: theme.colors.card }]}
            >
              {value === "Detected" && (
                <View
                  style={[styles.statusEnabled, { backgroundColor: "#8FBC8B" }]}
                />
              )}
              {value === "Not Detected" && (
                <View
                  style={[
                    styles.statusDisabled,
                    { backgroundColor: "#CD5C5C" },
                  ]}
                />
              )}

              {registerName.includes("Input") && (
                <Progress.Bar
                  progress={Number(value / 24.0)}
                  width={100}
                  color={theme.colors.primary}
                />
              )}

              {registerName.includes("Battery") && (
                <Progress.Bar
                  progress={Number(value / 16.48)}
                  width={100}
                  color={theme.colors.primary}
                />
              )}

              {registerName.includes("Sonic 1 Voltage") && (
                <Progress.Bar
                  progress={Number(value / 44.0)}
                  width={100}
                  color={theme.colors.primary}
                />
              )}

              {registerName.includes("Sonic 2 Voltage") && (
                <Progress.Bar
                  progress={Number(value / 44.0)}
                  width={100}
                  color={theme.colors.primary}
                />
              )}

              <Text style={[styles.subHeading, { color: theme.colors.text }]}>
                {registerName}
              </Text>
              <Text
                style={[styles.deviceInfoText, { color: theme.colors.text }]}
              >
                {value}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Loading Device Data...
            </Text>
            <ActivityIndicator size="large" color={theme.colors.primary} />
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
    marginHorizontal: 20,
    paddingBottom: 20,
  },
  mainHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#215387",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    gap: 5,
    borderRadius: 5,
    padding: 10,
    marginTop: 20,
  },

  image: {
    width: "100%",
    height: 200,
    maxWidth: 400,
    borderRadius: 15,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  },

  settingsCard: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    margin: 20,
    marginTop: 0,
    marginBottom: 40,
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
    gap: 10,
  },

  value: {
    fontSize: 16,
  },

  cardWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "space-between",
  },

  card: {
    flexBasis: "48%",
    gap: 10,
    // marginRight: 10,
    marginBottom: 20,
    padding: 20,
    width: 50,
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
    fontSize: 20,
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
