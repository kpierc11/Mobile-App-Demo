import { View, StyleSheet, Image } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useTheme } from "@react-navigation/native";

export default function CustomDrawerContent(props: any) {
  const theme = useTheme(); 

  const drawerImage = theme.dark ? require("../../assets/images/hbs-logo-white.png") : require("../../assets/images/hbs-splash.png");
  
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Image
          source={drawerImage}
          style={styles.avatar}
        />
      </View>

      <DrawerItemList style={{color:theme.colors.text}} {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    display: "flex",
    width: "100%",
    padding: 10,
  },
  avatar: {
    width: 170,
    height: 170,
    borderRadius: 35,
    marginBottom: 10,
  },
});
