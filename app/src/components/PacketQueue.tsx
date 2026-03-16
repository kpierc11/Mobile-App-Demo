import { createContext, ReactNode, useContext, useRef } from "react";
import BleManager from "react-native-ble-manager";
import { Packet, PacketTypes } from "@/src/utils/Packet";
import { UnitDataContext } from "./UnitDataProvider";
import { ParsedRegisterData } from "../types/parsedRegisterData";

const SERVICE_UUID = "00001000-0000-1000-8000-00805f9b34fb";
const WRITE_CHAR = "00001001-0000-1000-8000-00805f9b34fb";

interface PacketQueueProps {
  processImmediatePacket: (packet: Uint8Array, deviceID: string) => void;
  processIncomingPacket: (packet: Uint8Array, deviceID: string) => void;
}

const packetParser = new Packet();

export const PacketQueueContext = createContext<PacketQueueProps>({
  processImmediatePacket: () => {},
  processIncomingPacket: () => {},
});

const sendNewPacket = async (deviceID: string, packet: Uint8Array) => {
  try {
    await BleManager.connect(deviceID);
    await BleManager.retrieveServices(deviceID);
    await BleManager.write(deviceID, SERVICE_UUID, WRITE_CHAR, [...packet]);
    await BleManager.disconnect(deviceID);
  } catch (error) {
    console.log("BLE write error:", error);
  }
};

const processPacket = async (
  previousPacket: Uint8Array | null,
  currentPacket: Uint8Array,
  deviceID: string,
  setUnitData: (data: ParsedRegisterData[]) => void,
) => {
  try {
    if (currentPacket) {
      sendNewPacket(deviceID, currentPacket as Uint8Array);
    }
  } catch (error) {
    console.error("Packet parsing error:", error);
  }
};

const processResponsePacket = async (
  packet: Uint8Array,
  deviceID: string,
  setUnitData: (data: ParsedRegisterData[]) => void,
) => {
  try {
    console.log("Processing response packet:" + packet);
    let sendPacket = null;
    const parsedPacket = await packetParser.parsePacket(packet);

    const { type, currentPacket, regData } = parsedPacket;

    console.log("Packet type:" + type);

    if (type === PacketTypes.ACK_KNOWLEDGE) {
      sendPacket = packetParser.sendGetSensorData();
    }

    if (type === PacketTypes.PARSE_SENSOR_DATA) {
      let packetDataView = new DataView(packet.buffer, 0, packet.byteLength);
      let parsedRegData: any = [];
      const { newPacket, registerData } =
        packetParser.parseRegisterData(packetDataView);
      parsedRegData = registerData;
      setUnitData(parsedRegData);
      sendPacket = packetParser.sendGetSensorData();
    }

    if (sendPacket) {
      sendNewPacket(deviceID, sendPacket as Uint8Array);
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
  const previousPacketRef = useRef<Uint8Array>(null);

  const processImmediatePacket = async (
    packet: Uint8Array,
    deviceID: string,
  ) => {
    console.log("Previous Packet:", previousPacketRef.current);
    console.log("Current Packet:", packet);

    const previousPacket = previousPacketRef.current;

    await processPacket(previousPacket, packet, deviceID, setUnitData);
    previousPacketRef.current = packet;
  };

  const processIncomingPacket = async (
    packet: Uint8Array,
    deviceID: string,
  ) => {
    await new Promise((r) => setTimeout(r, 3000));
    await processResponsePacket(packet, deviceID, setUnitData);
  };

  return (
    <PacketQueueContext.Provider
      value={{ processImmediatePacket, processIncomingPacket }}
    >
      {children}
    </PacketQueueContext.Provider>
  );
}
