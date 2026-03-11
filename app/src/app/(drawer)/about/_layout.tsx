import { DrawerToggleButton } from "@react-navigation/drawer";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function AboutLayout() {
  const theme = useTheme();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "About",
          headerLeft: (props) => (
            <View style={{ marginLeft: -16 }}>
              <DrawerToggleButton {...props} tintColor={theme.colors.primary} />
            </View>
          ),
        }}
      />

      <Stack.Screen
        name="supported-devices"
        options={{ title: "Supported Devices" }}
      />
    </Stack>
  );
}
