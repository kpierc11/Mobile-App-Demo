import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "@/src/components/CustomDrawerContent";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";
import { View } from "react-native";
import { DrawerToggleButton } from "@react-navigation/drawer";

export default function DrawerLayout() {
  const theme = useTheme();

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        headerTintColor: theme.colors.primary,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.text,
        drawerStyle: { backgroundColor: theme.colors.card },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="index"
        options={{
          headerShown: true,
          title: "MyQuattro™",
          headerTitleStyle: { color: theme.colors.text },
          drawerLabel: "Scan Devices",
          drawerIcon: ({ size, color }) => (
            <MaterialCommunityIcons
              name="cast-connected"
              size={size}
              color={color}
            />
          ),
          headerLeft: (props) => (
            <View>
              <DrawerToggleButton {...props} tintColor={theme.colors.primary} />
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="about"
        options={{
          title: "About",
          drawerLabel: "About",
          headerShown: false,
          drawerIcon: ({ size, color }) => (
            <MaterialCommunityIcons
              name="file-document"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: "Settings",
          drawerLabel: "Settings",
          headerBackButtonDisplayMode: "default",
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="privacy"
        options={{
          title: "Privacy Policy",
          headerTitleStyle: { color: theme.colors.text },
          headerBackButtonDisplayMode: "default",
          drawerLabel: "Privacy Policy",
          drawerIcon: ({ size, color }) => (
            <MaterialCommunityIcons
              name="file-document"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Drawer>
  );
}
