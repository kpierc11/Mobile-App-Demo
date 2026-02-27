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
import * as Progress from "react-native-progress";

import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { storage } from "../_layout";

export default function DeviceDetails() {
  const { deviceDetails } = useLocalSearchParams();
  const { unitData, unitImageURL } = useContext(UnitDataContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [text, onChangeText] = useState("Useless Text");
  const [number, onChangeNumber] = useState("");
  const [storedDeviceName, setStoredDeviceName] = useState("");

  const parsedDetails = deviceDetails
    ? JSON.parse(deviceDetails as string)
    : {};

  const { name, imageURL } = parsedDetails;

  if (!deviceDetails) return <Text>No device data available..</Text>;

  const handleModalSubmit = () => {
    setModalVisible(!modalVisible);
  };

  const getStoredDeviceName = async () => {
    const storedName = await storage.getItem(name);
    if (!storedName) {
      return "";
    }
    return storedName;
  };

  useEffect(() => {
    getStoredDeviceName().then((storedDeviceName) =>
      setStoredDeviceName(storedDeviceName),
    );
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/hbs-splash.png")}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={styles.deviceMainInfo}>
          <View>
            <Text style={styles.deviceMainText}>Device Name:</Text>
            <Text style={styles.deviceMainText}>
              {storedDeviceName != "" ? storedDeviceName : name}
            </Text>
          </View>
          <Pressable
            style={{}}
            onPress={() =>
              router.push({
                pathname: "/device/edit-alias",
                params: {
                  currentDeviceID: name,
                },
              })
            }
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={24}
              color="black"
            />
          </Pressable>
        </View>
        <View
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          {unitData.length > 0 ? (
            unitData.map(({ registerName, value }) => (
              <View key={registerName} style={styles.card}>
                {value === "Enabled" ? (
                  <View style={styles.statusEnabled}></View>
                ) : (
                  <></>
                )}
                {value === "Disabled" ? (
                  <View style={styles.statusDisabled}></View>
                ) : (
                  <></>
                )}

                {registerName.includes("Voltage") ? (
                  <Progress.Bar progress={0.8} width={100} />
                ) : (
                  <></>
                )}
                <Text style={styles.subHeading}>{registerName}</Text>
                <Text style={styles.deviceInfoText}>{value}</Text>
              </View>
            ))
          ) : (
            <View style={{ flex: 1, paddingHorizontal: 20 }}>
              <Text
                style={{ textAlign: "center", marginTop: 20, fontSize: 18 }}
              >
                Loading Device Data...
              </Text>
              <ActivityIndicator style={{ marginTop: 20 }} size="large" />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },
  iconContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  icon: {
    backgroundColor: "#215387",
    borderRadius: 99,
    padding: 8,
  },

  header: {
    alignItems: "flex-start",
    justifyContent: "center",
    paddingVertical: 1,
    fontSize: 20,
  },

  scrollView: {
    marginTop: 0,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginLeft: 10,
  },

  deviceTitle: {
    fontSize: 25,
    fontWeight: "400",
    textAlign: "center",
    color: "black",
  },

  deviceMainInfo: {
    display: "flex",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    textAlign: "left",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },

  deviceMainText: {
    fontSize: 18,
    color: "black",
  },

  subHeading: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "left",
    color: "black",
    marginBottom: 4,
    marginTop: 10,
  },

  deviceInfoText: {
    marginTop: 5,
    fontSize: 19,
    fontWeight: "500",
  },

  card: {
    borderColor: "black",
    flexBasis: "48%",
    margin: "1%",
    borderWidth: 0,
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1.84,
    elevation: 2,
    borderRadius: 10,
    height: "auto",
    maxHeight: 250,
  },
  image: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 150,
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

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    display: "flex",
    justifyContent: "flex-start",
    borderRadius: 10,
    width: 300,
    height: 200,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    backgroundColor: "#215387",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 5,
    padding: 12,
    marginTop: 20,
  },
  buttonClose: {
    backgroundColor: "#215387",
  },
  textStyle: {
    color: "white",
    fontWeight: "500",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    height: 60,
    margin: 12,
    width: 200,
    fontSize: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#DCDCDC",
    padding: 10,
  },
});
