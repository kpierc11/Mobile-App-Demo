import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Image } from "expo-image";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";

export default function About() {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>About</Text>

      <View
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Image
          style={styles.image}
          source={require("../../../../assets/images/myquattro-app-icon-sky-blue-3.png")}
          contentFit="cover"
        />
        <View style={{ marginTop: 10, alignItems: "center" }}>
          <Text style={{ color: theme.colors.text }}>MyQuattro</Text>
          <Text style={{ color: theme.colors.text }}>Version: 1.0.0</Text>
        </View>
      </View>

      <View
        style={[styles.settingsCard, { backgroundColor: theme.colors.card }]}
      >
        <View style={styles.iconMainContainer}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() =>
              Linking.openURL("https://www.hydro-bioscience.com/about-us/")
            }
          >
            <MaterialCommunityIcons
              name="web"
              size={24}
              color={theme.colors.text}
            />
            <Text style={{ marginRight: "auto", color: theme.colors.text }}>
              Who We Are
            </Text>
            <Feather
              style={{ alignContent: "flex-end" }}
              name="external-link"
              size={18}
              color={theme.colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => router.navigate("/about/supported-devices")}
          >
            <MaterialIcons
              name="device-hub"
              size={24}
              color={theme.colors.text}
            />
            <Text style={{ marginRight: "auto", color: theme.colors.text }}>
              Supported Devices
            </Text>
            <MaterialIcons
              style={{ alignContent: "flex-end" }}
              name="chevron-right"
              size={20}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() =>
              Linking.openURL(
                "https://www.hydro-bioscience.com/media/MNUL0063-V001.pdf",
              )
            }
          >
            <MaterialCommunityIcons name="file-document" size={24} color={theme.colors.text}/>
            <Text style={{ marginRight: "auto", color: theme.colors.text }}>
              User Manual
            </Text>
            <Feather
              style={{ alignContent: "flex-end" }}
              name="external-link"
              size={18}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ alignItems: "center", marginTop:"80%" }}>
        <Text style={{ color: theme.colors.text }}>
          © {new Date().getFullYear()} Hydro Bioscience
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  settingsCard: {
    display: "flex",
    justifyContent: "center",
    borderColor: "black",
    width: "100%",
    borderWidth: 0,
    padding: 10,
    borderRadius: 10,
  },

  iconMainContainer: {
    display: "flex",
    marginRight: "auto",
    gap: 10,
    width: "100%",
  },
  iconContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  image: {
    height: 75,
    width: 75,
    borderRadius: 15,
  },
});
