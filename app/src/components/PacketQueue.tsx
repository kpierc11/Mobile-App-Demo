import { createContext, ReactNode, useContext, useRef } from "react";
import BleManager from "react-native-ble-manager";
import { Packet, PacketTypes } from "@/src/utils/Packet";
import { UnitDataContext } from "./UnitDataProvider";
import { ParsedRegisterData } from "../types/parsedRegisterData";

const SERVICE_UUID = "00001000-0000-1000-8000-00805f9b34fb";
const WRITE_CHAR = "00001001-0000-1000-8000-00805f9b34fb";

interface PacketQueueProps {
  queuePacket: (packet: Uint8Array, deviceID: string) => void;
}

const packetParser = new Packet();

export const PacketQueueContext = createContext<PacketQueueProps>({
  queuePacket: () => {},
});

const sendNewPacket = async (deviceID: string, packet: Uint8Array) => {
  try {
    await BleManager.write(deviceID, SERVICE_UUID, WRITE_CHAR, [...packet]);
  } catch (error) {
    console.error("BLE write error:", error);
  }
};

const processQueue = async (
  packet: Uint8Array,
  deviceID: string,
  setUnitData: (data: ParsedRegisterData[]) => void,
) => {
  try {
    const parsedReturnData = await packetParser.parsePacket(packet);

    let sendPacket: Uint8Array | null = null;

    const { type, currentPacket: parsedPacket, regData } = parsedReturnData;

    if (type === PacketTypes.IDENTIFY) {
      sendPacket = packet;
    } else if (type === PacketTypes.GET_SENSOR_DATA) {
      sendPacket = parsedPacket;
    } else if (type === PacketTypes.PARSE_SENSOR_DATA) {
      setUnitData(regData);
      sendPacket = packetParser.sendGetSensorData();
    }
    else {
      packetParser.get
    }

    if (sendPacket) {
      setTimeout(() => {
        sendNewPacket(deviceID, sendPacket as Uint8Array);
      }, 3000);
    }
  } catch (error) {
    console.error("Packet parsing error:", error);
  }
};

export default function PacketQueueProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { setUnitData } = useContext(UnitDataContext);

  const queuePacket = async (packet: Uint8Array, deviceID: string) => {
    console.log("Incoming packet:", packet);
    processQueue(packet, deviceID, setUnitData);
  };

  return (
    <PacketQueueContext.Provider value={{ queuePacket }}>
      {children}
    </PacketQueueContext.Provider>
  );
}
