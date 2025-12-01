import { useGlobalSearchParams, useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';
import { Peripheral } from 'react-native-ble-manager';

export default function DeviceDetails() {
  const { deviceDetails } = useLocalSearchParams();

  // Handle string[] or string
  const deviceString = Array.isArray(deviceDetails) ? deviceDetails[0] : deviceDetails;

  if (!deviceString) return <Text>No device data</Text>;

  const device = JSON.parse(deviceString);

  const { id, name, type } = device;
  
  return (
    <View>
      <Text>Details Page</Text>
      <Text>ID: {id}</Text>
      <Text>Info: {name}</Text>
    </View>
  );
}