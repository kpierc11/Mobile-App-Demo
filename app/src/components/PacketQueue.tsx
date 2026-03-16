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

const packetsEqual = (a: Uint8Array | null, b: Uint8Array) => {
  if (!a) return false;
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
};

export const PacketQueueContext = createContext<PacketQueueProps>({
  processImmediatePacket: () => {},
  processIncomingPacket: () => {},
});

const sendNewPacket = async (deviceID: string, packet: Uint8Array) => {
  try {
    await BleManager.write(deviceID, SERVICE_UUID, WRITE_CHAR, [...packet]);
  } catch (error) {
    console.error("BLE write error:", error);
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

    processPacket(previousPacket, packet, deviceID, setUnitData);
    previousPacketRef.current = packet;
  };

  return (
    <PacketQueueContext.Provider value={{ processImmediatePacket }}>
      {children}
    </PacketQueueContext.Provider>
  );
}
