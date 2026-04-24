import { ScrollView, View, Text, StyleSheet, Linking } from "react-native";
import { useTheme } from "@react-navigation/native";

export default function PrivacyPolicy() {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Privacy Policy
      </Text>

      <Text style={[styles.date, { color: theme.colors.text }]}>
        Last updated: April 24, 2026
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        MyQuattro (“the App”) respects your privacy. This Privacy Policy explains
        how the App handles information when you use it.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Information We Access
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        MyQuattro uses Bluetooth Low Energy (BLE) to enable its core functionality.
        When you use the App, it may access nearby Bluetooth-enabled devices in
        order to discover and connect to compatible devices.
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        This process may involve temporary access to device identifiers and
        connection-related information required for Bluetooth communication.
        This data is used only while the App is running and is not stored or
        transmitted to external servers.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Data Storage
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        MyQuattro does not store Bluetooth scan results, device identifiers, or
        connection data on external servers. All Bluetooth-related information
        is used temporarily on your device and is discarded when no longer needed.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Data Sharing
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        We do not sell, rent, or share any user or Bluetooth-related data with
        third parties.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Location
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        MyQuattro does not track or store your precise location. However,
        Bluetooth scanning may involve proximity signals necessary for device
        discovery and connection.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Third-Party Services
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        The App does not use advertising networks or analytics SDKs for tracking
        or user profiling.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Children's Privacy
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        The App does not knowingly collect personal information from users of any
        age, including children under 13.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Changes to This Policy
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        If the App is updated in the future in a way that changes how data is
        used, this Privacy Policy will be updated accordingly.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Contact
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        If you have any questions about this Privacy Policy, you can contact:
      </Text>

      <Text
        style={[styles.link, { color: theme.colors.primary }]}
        onPress={() => Linking.openURL("mailto:dev@dpipower.com")}
      >
        dev@dpipower.com
      </Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
  },
  section: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10,
  },
  link: {
    fontSize: 16,
    textDecorationLine: "underline",
    marginTop: 5,
  },
});