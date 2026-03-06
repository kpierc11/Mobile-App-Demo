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

export default function DeviceDetails() {
  const theme = useTheme();
  const { deviceDetails } = useLocalSearchParams();
  const { unitData } = useContext(UnitDataContext);
  const [storedDeviceName, setStoredDeviceName] = useState("");
  const foundDeviceImage = theme.dark
    ? require("../../../assets/images/hbs-logo-white.png")
    : require("../../../assets/images/hbs-splash.png");

  const parsedDetails = deviceDetails
    ? JSON.parse(deviceDetails as string)
    : {};

  const { name, id } = parsedDetails;

  const getStoredDeviceName = async () => {
    try {
      const storedName = await SettingsStore.getValueFor(id);
      if (storedName) {
        setStoredDeviceName(storedName);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getStoredDeviceName();
  });

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
        source={foundDeviceImage}
        style={styles.image}
        resizeMode="contain"
      />

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
                Name:
              </Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>
                {storedDeviceName ? storedDeviceName : name}
              </Text>
            </View>
            <Feather name="edit" size={18} color={theme.colors.text} />
          </TouchableOpacity>

          {/* Device ID */}
          <View style={{display:"flex", flexDirection:"row", gap:2}}>
            <Text style={[styles.label, { color: theme.colors.text, marginRight:5, }]}>
              ID:
            </Text>
            <View style={{display:"flex", flexWrap:"wrap"}}>
            <Text style={[styles.value, { color: theme.colors.text, flexWrap:"wrap", width:250}]}>
              {id}
            </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Device Registers */}
      <View style={styles.cardWrapper}>
        {unitData.length > 0 ? (
          unitData.map(({ registerName, value }) => (
            <View
              key={registerName}
              style={[styles.card, { backgroundColor: theme.colors.card }]}
            >
              {value === "Enabled" && (
                <View
                  style={[styles.statusEnabled, { backgroundColor: "#8FBC8B" }]}
                />
              )}
              {value === "Disabled" && (
                <View
                  style={[
                    styles.statusDisabled,
                    { backgroundColor: "#CD5C5C" },
                  ]}
                />
              )}

              {registerName.includes("Voltage") && (
                <Progress.Bar
                  progress={0.8}
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
    marginHorizontal: 10,
  },

  image: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },

  settingsCard: {
    width: "95%",
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
  },

  card: {
    flexBasis: "48%",
    margin: "1%",
    marginBottom: 20,
    padding: 20,
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
