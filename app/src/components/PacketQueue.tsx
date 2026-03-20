import { createContext, ReactNode, useContext, useRef } from "react";
import BleManager from "react-native-ble-manager";
import { Packet, PacketTypes } from "@/src/utils/Packet";
import { UnitDataContext } from "./UnitDataProvider";
import { ParsedRegisterData } from "../types/parsedRegisterData";
import { BLE_CONFIG } from "../constants/bleConfig";

interface PacketQueueProps {
  processImmediatePacket: (packet: Uint8Array, deviceID: string) => void;
  processIncomingPacket: (packet: Uint8Array, deviceID: string) => void;
}

const packetParser = new Packet();

export const PacketQueueContext = createContext<PacketQueueProps>({
  processImmediatePacket: () => {},
  processIncomingPacket: () => {},
});

const sendProcessedPacket = async (deviceID: string, packet: Uint8Array) => {
  try {
    await BleManager.connect(deviceID);
    await BleManager.retrieveServices(deviceID);
    await BleManager.write(
      deviceID,
      BLE_CONFIG.SERVICE_UUID,
      BLE_CONFIG.WRITE_CHAR,
      [...packet],
    );
  } catch (error) {
    console.log("BLE write error:", error);
  }
};

const sendImmediatePacket = async (deviceID: string, packet: Uint8Array) => {
  try {
    const connected = await BleManager.isPeripheralConnected(deviceID, []);
    if (!connected) {
      await BleManager.connect(deviceID);
      await BleManager.retrieveServices(deviceID);
    }
    await BleManager.write(
      deviceID,
      BLE_CONFIG.SERVICE_UUID,
      BLE_CONFIG.WRITE_CHAR,
      [...packet],
    );
  } catch (error) {
    console.log("BLE write error:", error);
  }
};

const processPacket = async (
  previousPacket: Uint8Array | null,
  currentPacket: Uint8Array,
  deviceID: string,
) => {
  try {
    if (currentPacket) {
      sendImmediatePacket(deviceID, currentPacket as Uint8Array);
    }
  } catch (error) {
    console.error("Packet parsing error:", error);
  }
};

const processResponsePacket = async (
  packet: Uint8Array,
  deviceID: string,
  setUnitData: (data: ParsedRegisterData[]) => void,
  setUnitHID: (hardwareID: number) => void,
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
      if (packetParser.header.source.hID) {
        setUnitHID(packetParser.header.source.hID);
      }
      await new Promise((r) => setTimeout(r, 3000));
      sendPacket = packetParser.sendGetSensorData();
    }

    if (sendPacket) {
      sendProcessedPacket(deviceID, sendPacket as Uint8Array);
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
  const { setUnitData, setUnitHID } = useContext(UnitDataContext);
  const previousPacketRef = useRef<Uint8Array>(null);

  const processImmediatePacket = async (
    packet: Uint8Array,
    deviceID: string,
  ) => {
    console.log("Previous Packet:", previousPacketRef.current);
    console.log("Current Packet:", packet);

    const previousPacket = previousPacketRef.current;

    await processPacket(previousPacket, packet, deviceID);
    previousPacketRef.current = packet;
  };

  const processIncomingPacket = async (
    packet: Uint8Array,
    deviceID: string,
  ) => {
    await processResponsePacket(packet, deviceID, setUnitData, setUnitHID);
  };

  return (
    <PacketQueueContext.Provider
      value={{ processImmediatePacket, processIncomingPacket }}
    >
      {children}
    </PacketQueueContext.Provider>
  );
}
