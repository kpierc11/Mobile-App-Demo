// CustomDrawer.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';

export default function CustomDrawerContent(props:any) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Image
          source={require('../assets/images/hbs-spash.png')}
          style={styles.avatar}
        />
      </View>

      <DrawerItemList {...props} />

     
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    display:"flex", 
    
    width:"100%",
    padding: 10,
  },
  avatar: {
    width: 170,
    height: 170,
    borderRadius: 35,
    marginBottom: 10,
  },
  username: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
