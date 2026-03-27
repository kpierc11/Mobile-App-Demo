import { createContext, ReactNode, useContext, useEffect, useRef } from "react";
import BleManager from "react-native-ble-manager";
import { Packet, PacketTypes } from "@/src/utils/Packet";
import { UnitDataContext } from "./UnitDataProvider";
import { ParsedRegisterData } from "../types/parsedRegisterData";
import { BLE_CONFIG } from "../constants/bleConfig";

interface PacketQueueProps {
  processImmediatePacket: (
    packet: Uint8Array | null,
    deviceID: string,
  ) => Promise<void>;
  processResponsePacket: (packet: Uint8Array) => Promise<void>;
}

const packetParser = new Packet();

export const PacketQueueContext = createContext<PacketQueueProps>({
  processImmediatePacket: async () => {},
  processResponsePacket: async () => {},
});

const packetsEqual = (a: Uint8Array | null, b: Uint8Array) => {
  if (!a) {
    return;
  }
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const processSensorData = (
  packet: Uint8Array,
  setUnitData: (data: ParsedRegisterData[]) => void,
  setUnitHID: (hardwareID: number) => void,
) => {
  const packetDataView = new DataView(packet.buffer, 0, packet.byteLength);

  const { registerData } = packetParser.parseRegisterData(packetDataView);
  let parsedRegData: any = [];
  parsedRegData = registerData;

  setUnitData(parsedRegData);

  if (packetParser.header.source.hID) {
    setUnitHID(packetParser.header.source.hID);
  }
};

const processQuattroSchedule = (packet:Uint8Array) =>{

  let byteOffset = 16 + 8 + 3;
  for(let i = byteOffset; i < packet.length; i++)
  {
    console.log(packet[i]);
  }
}

const ensureConnected = async (deviceID: string) => {
  const connected = await BleManager.isPeripheralConnected(deviceID, []);
  if (!connected) {
    await BleManager.connect(deviceID);
    await BleManager.retrieveServices(deviceID);
  }
};

const writePacket = async (deviceID: string, packet: Uint8Array) => {
  try {
    await ensureConnected(deviceID);

    await BleManager.write(
      deviceID,
      BLE_CONFIG.SERVICE_UUID,
      BLE_CONFIG.WRITE_CHAR,
      [...packet],
    );
  } catch (error) {
    console.error("BLE write error:", error);
  }
};

export default function PacketQueueProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { setUnitData, setUnitHID } = useContext(UnitDataContext);
  const latestPacket = useRef<Uint8Array>(null);
  const deviceIDRef = useRef<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!deviceIDRef.current) return;

      const packet = latestPacket.current ?? packetParser.sendGetSensorData();

      await writePacket(deviceIDRef.current, packet);

      latestPacket.current = null;
    }, 2000);

    return () => clearInterval(interval);
  }, [deviceIDRef.current]);

  const processImmediatePacket = async (
    packet: Uint8Array | null,
    deviceID: string,
  ) => {
    deviceIDRef.current = deviceID;
    if (!packet) {
      latestPacket.current = packetParser.sendGetSensorData();
    } else {
      latestPacket.current = packet;
    }
  };

  const processResponsePacket = async (packet: Uint8Array) => {
    try {
      const parsedPacket = await packetParser.parsePacket(packet);
      const { type } = parsedPacket;

      if (type === PacketTypes.PARSE_SENSOR_DATA) {
        processSensorData(packet, setUnitData, setUnitHID);
      }

      if(type === PacketTypes.QUATTRO_SCHEDULE) {
          processQuattroSchedule(packet)
      }
    } catch (error) {
      console.error("Packet parsing error:", error);
    }
  };

  return (
    <PacketQueueContext.Provider
      value={{ processImmediatePacket, processResponsePacket }}
    >
      {children}
    </PacketQueueContext.Provider>
  );
}
