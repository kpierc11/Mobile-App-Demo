import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "@/src/components/CustomDrawerContent";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";

export default function DrawerLayout() {
  const theme = useTheme();
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerTintColor: theme.colors.text,
        drawerActiveTintColor: "#215387",
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "MyQuattro™",
          drawerLabel: "Scan Devices",
          drawerIcon: ({ size, color }) => (
            <MaterialCommunityIcons
              name="cast-connected"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="about"
        options={{
          title: "About",
          drawerLabel: "About",
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
          headerShown:false,
          drawerLabel: "Settings",
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="privacy-policy"
        options={{
          title: "Privacy Policy",
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
      <Drawer.Screen
        name="user-manual"
        options={{
          title: "User Manual",
          drawerLabel: "User Manual",
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
