import { createContext, ReactNode, useRef } from "react";
import BleManager, { Peripheral } from "react-native-ble-manager";
import { Packet, PacketTypes } from "@/src/utils/Packet";
import { HbsDevice } from "../types/hbsDevice";

const SERVICE_UUID = "00001000-0000-1000-8000-00805f9b34fb";
const WRITE_CHAR = "00001001-0000-1000-8000-00805f9b34fb";

interface PacketQueueProps {
  deviceID: number;
  currentPacket: Uint8Array;
  queuePacket: (packet: Uint8Array) => void;
}

const packet = new Packet();
export const PacketQueueContext = createContext<PacketQueueProps>({
  deviceID: 0,
  currentPacket: new Uint8Array(),
  queuePacket: () => {},
});

const sendNewPacket = async (deviceID: string, packet: Uint8Array) => {
  try {
    await BleManager.write(deviceID, SERVICE_UUID, WRITE_CHAR, [...packet]);
  } catch (error) {}
};

const handleResponsePacket = async (
  returnData: Uint8Array<any>,
  id: string,
) => {
  try {
    const parsedReturnData = await packet.parsePacket(returnData);
    let sendPacket = null;
    const { type, currentPacket, regData } = parsedReturnData;

    if (type == PacketTypes.GET_SENSOR_DATA) {
      sendPacket = currentPacket;
    }

    if (type == PacketTypes.PARSE_SENSOR_DATA) {
      setUnitData(regData);
      sendPacket = packet.sendGetSensorData();
    }

    if (sendPacket) {
      setTimeout(() => {
        sendNewPacket(id, sendPacket);
      }, 3000);
    }
  } catch (error) {}
};

export default function PacketQueueProvider({
  children,
}: {
  children: ReactNode;
}) {
  const currentPacket = new Uint8Array();
  const queuePacket = (packet: Uint8Array) => {
    console.log(packet);
  };

  let deviceID = 0;

  return (
    <PacketQueueContext value={{ deviceID, currentPacket, queuePacket }}>
      {children}
    </PacketQueueContext>
  );
}
