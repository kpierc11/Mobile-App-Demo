import { Stack, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { HeaderBackButton } from "@react-navigation/elements"; // recommended
import React from "react";

export default function DeviceLayout() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Stack>
      {/* Device Details Page */}
      <Stack.Screen
        name="[id]"
        options={{
          title: "Device Details",
          // Use HeaderBackButton for perfect alignment
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              label="Devices"
              labelStyle={{ fontSize: 16, color: theme.colors.primary }}
              onPress={() => router.back()}
              tintColor={theme.colors.primary}
            />
          ),
        }}
      />
      <Stack.Screen
        name="edit-alias"
        options={{
          title: "Edit Alias",
        }}
      />
      <Stack.Screen
        name="quattro-scheduler"
        options={{
          title: "Quattro Scheduler",
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
  },
  headerLeftContainer: {
    paddingLeft: 0,
    marginLeft: 0,
  },
});