import { Peripheral } from "react-native-ble-manager";

export interface HbsDevice {
  device: Peripheral;
  storedDeviceName: string;
  imageLink:string;
}