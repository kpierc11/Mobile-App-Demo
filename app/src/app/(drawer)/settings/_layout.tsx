import { DrawerToggleButton } from "@react-navigation/drawer";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function SettingsLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        contentStyle: { width: "100%", margin: 0, padding: 0 },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
          headerLeft: (props) => (
            <View style={{ marginLeft: -16 }}>
              <DrawerToggleButton {...props} tintColor={theme.colors.primary} />
            </View>
          ),
        }}
      />
      <Stack.Screen name="appearance" options={{ title: "Appearance" }} />
      <Stack.Screen name="language" options={{ title: "Language" }} />
    </Stack>
  );
}
