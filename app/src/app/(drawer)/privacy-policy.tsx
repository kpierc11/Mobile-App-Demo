import React from "react";
import { ScrollView, View, Text, StyleSheet, Linking } from "react-native";
import { useTheme } from "@react-navigation/native";

export default function PrivacyPolicy() {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Privacy Policy</Text>
      <Text style={[styles.date, { color: theme.colors.text }]}>
        Last updated: September 27, 2022
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        This Privacy Policy describes Our policies and procedures on the
        collection, use and disclosure of Your information when You use the
        Service and tells You about Your privacy rights and how the law protects
        You.
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        We use Your Personal data to provide and improve the Service. By using
        the Service, You agree to the collection and use of information in
        accordance with this Privacy Policy.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Interpretation and Definitions
      </Text>

      <Text style={[styles.subSectionTitle, { color: theme.colors.text }]}>Interpretation</Text>
      <Text style={[styles.section, { color: theme.colors.text }]}>
        The words of which the initial letter is capitalized have meanings
        defined under the following conditions. The following definitions shall
        have the same meaning regardless of whether they appear in singular or
        in plural.
      </Text>

      <Text style={[styles.subSectionTitle, { color: theme.colors.text }]}>Definitions</Text>
      <Text style={[styles.section, { color: theme.colors.text }]}>
        <Text style={[styles.bold, { color: theme.colors.text }]}>Account:</Text> means a unique
        account created for You to access our Service or parts of our Service.
      </Text>
      <Text style={[styles.section, { color: theme.colors.text }]}>
        <Text style={[styles.bold, { color: theme.colors.text }]}>Affiliate:</Text> means an entity
        that controls, is controlled by or is under common control with a party...
      </Text>
      <Text style={[styles.section, { color: theme.colors.text }]}>
        <Text style={[styles.bold, { color: theme.colors.text }]}>Application:</Text> means the
        software program provided by the Company downloaded by You on any electronic device,
        named MyQuattro.
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        <Text style={[styles.bold, { color: theme.colors.text }]}>Company:</Text> Hydro Bio Science, LLC, 123
        Main St, Town, TN 77787. Referred to as "the Company", "We", "Us", or "Our".
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        <Text style={[styles.bold, { color: theme.colors.text }]}>Country:</Text> Tennessee, United States.
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        <Text style={[styles.bold, { color: theme.colors.text }]}>Device:</Text> Any device that can access the
        Service such as a computer, cellphone, or tablet.
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        <Text style={[styles.bold, { color: theme.colors.text }]}>Personal Data:</Text> Any information that
        relates to an identified or identifiable individual.
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        <Text style={[styles.bold, { color: theme.colors.text }]}>Service:</Text> Refers to the Application.
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        <Text style={[styles.bold, { color: theme.colors.text }]}>Service Provider:</Text> Any natural or legal
        person who processes data on behalf of the Company.
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        <Text style={[styles.bold, { color: theme.colors.text }]}>Usage Data:</Text> Data collected
        automatically from your use of the Service.
      </Text>

      <Text style={[styles.section, { color: theme.colors.text }]}>
        <Text style={[styles.bold, { color: theme.colors.text }]}>You:</Text> The individual accessing or using
        the Service.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Collecting and Using Your Personal Data
      </Text>
      <Text style={[styles.section, { color: theme.colors.text }]}>
        We may collect personal data such as Usage Data automatically when you
        use the Service. Information collected may include IP address, browser
        type, pages visited, and device identifiers.
      </Text>
      <Text style={[styles.section, { color: theme.colors.text }]}>
        While using our Application, we may collect location information, with
        your permission, to provide and improve the Service. You can enable or
        disable this through your device settings.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Use of Your Personal Data</Text>
      <Text style={[styles.section, { color: theme.colors.text }]}>
        We may use Personal Data to provide and maintain our Service, manage
        your account, contact you, provide updates, manage requests, conduct
        business transfers, and for data analysis.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sharing Your Personal Information</Text>
      <Text style={[styles.section, { color: theme.colors.text }]}>
        We may share your personal information with service providers,
        affiliates, business partners, or for business transfers. We may also
        share information with your consent or when interacting publicly with
        other users.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Retention, Transfer, and Deletion of Personal Data
      </Text>
      <Text style={[styles.section, { color: theme.colors.text }]}>
        We retain your data only as long as necessary to comply with legal
        obligations, resolve disputes, and improve the Service. You can request
        deletion of your personal data by contacting us or via your account
        settings.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Security of Your Personal Data</Text>
      <Text style={[styles.section, { color: theme.colors.text }]}>
        While we take reasonable measures to protect your data, no method of
        transmission or storage is 100% secure.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Children's Privacy</Text>
      <Text style={[styles.section, { color: theme.colors.text }]}>
        Our Service does not address children under 13. If we become aware that
        we have collected data from a child, we remove it immediately.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Links to Other Websites</Text>
      <Text style={[styles.section, { color: theme.colors.text }]}>
        Our Service may contain links to third-party websites. We are not
        responsible for their content or privacy practices.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Changes to this Privacy Policy</Text>
      <Text style={[styles.section, { color: theme.colors.text }]}>
        We may update this Privacy Policy from time to time. Updates will be
        posted here with the revised "Last updated" date.
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contact Us</Text>
      <Text style={[styles.section, { color: theme.colors.text }]}>
        If you have questions, visit our website:{" "}
        <Text
          style={[styles.link, { color: theme.colors.primary }]}
          onPress={() => Linking.openURL("http://www.hydro-bioscience.com")}
        >
          http://www.hydro-bioscience.com
        </Text>
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
    color: "#555", // overridden by theme
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 3,
  },
  section: {
    fontSize: 16,
    lineHeight: 22,
    color: "#333", // overridden by theme
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
  },
  link: {
    textDecorationLine: "underline",
    // color overridden by theme
  },
});