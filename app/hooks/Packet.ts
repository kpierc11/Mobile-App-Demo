import { ParsedRegisterData } from "@/interfaces/parsedRegisterData";
import { Register } from "./Register";

interface CUID {
  fID: number;
  hID: number;
  serNum: number;
}

interface ParsedPacket {
  type: string;
  packet: Uint8Array;
}

enum PacketCmds {
  CBIN_PACKET_GET = 1,
  CBIN_PACKET_SET = 2,
  CBIN_PACKET_GET_DATA = 3,
  CBIN_PACKET_SET_ACK = 4,
  CBIN_PACKET_IDENTIFY_MODE = 20,
}

export class Packet {
  uIDServer: CUID;
  uIDIdentityPacket: CUID;
  uIDBroadcastPacket: CUID;

  header: {
    signature: number;
    length: number;
    source: CUID;
    destination: CUID;
  };

  buffer: ArrayBuffer;
  dataView: DataView;

  register: Register;

  constructor() {
    this.uIDServer = { fID: 0x00, hID: 0x00, serNum: 0x00000001 };
    this.uIDIdentityPacket = { fID: 0x00, hID: 0x00, serNum: 0x0000001f };
    this.uIDBroadcastPacket = { fID: 0x00, hID: 0x00, serNum: 0x00001fff };

    this.header = {
      signature: 0xb2c2,
      length: 16,
      destination: { fID: 0, hID: 0, serNum: 0 },
      source: { fID: 0, hID: 0, serNum: 0 },
    };
    this.buffer = new ArrayBuffer(250);
    this.dataView = new DataView(this.buffer);
    this.register = new Register();
  }

  /**
   * This function creates the set time packet that is initially sent on connection to the solar controller via BLE
   * @returns Uint8Array
   */
  sendSetTime(): Uint8Array {
    let byteOffset = this.header.length;
    let adjustedHeaderSize = 0;

    this.createHeaderChunk(this.uIDBroadcastPacket, this.uIDServer);

    //8 random bytes
    for (let i = 0; i < 8; i++) {
      this.dataView.setUint8(byteOffset++, Math.floor(Math.random() * 0));
      adjustedHeaderSize += 1;
    }

    //Set Command
    this.dataView.setUint8(byteOffset++, PacketCmds.CBIN_PACKET_SET);
    adjustedHeaderSize += 1;

    //Set Time
    //register ID for time
    this.dataView.setUint8(byteOffset++, 1);
    this.dataView.setUint8(byteOffset++, 0);

    //Number of bytes for the time value
    this.dataView.setUint8(byteOffset++, 4);

    // Set Time
    const now = new Date();
    const localTimestamp = Math.floor(
      (now.getTime() - now.getTimezoneOffset() * 60000) / 1000,
    );
    const timeBuffer = new ArrayBuffer(4);
    const timeView = new DataView(timeBuffer);
    timeView.setUint32(0, localTimestamp);
    const timeValue = timeView.getUint32(0, true);

    this.dataView.setUint32(byteOffset, timeValue);
    byteOffset += 4;
    adjustedHeaderSize += 7;

    //Update Header Length
    this.dataView.setUint8(2, adjustedHeaderSize);

    let ck = 0;
    for (let i = 0; i < byteOffset; i++) {
      ck -= this.dataView.getInt8(i);
    }

    //Add Checksum
    this.dataView.setUint8(byteOffset++, ck & 0xff);

    console.log(
      "Send Set Time Packet:" +
        new Uint8Array(this.dataView.buffer, 0, byteOffset),
    );

    return new Uint8Array(this.dataView.buffer, 0, byteOffset);
  }

  sendIdentifyUnit() {
    let byteOffset = 16;
    let adjustedHeaderSize = 0;
    this.createHeaderChunk(this.uIDBroadcastPacket, this.uIDServer);

    //8 random bytes
    for (let i = 0; i < 8; i++) {
      this.dataView.setUint8(byteOffset++, Math.floor(Math.random() * 0));
      adjustedHeaderSize += 1;
    }

    //Set Command
    this.dataView.setUint8(byteOffset++, PacketCmds.CBIN_PACKET_IDENTIFY_MODE);
    adjustedHeaderSize += 1;

    //
    this.dataView.setUint8(byteOffset++, -120);
    this.dataView.setUint8(byteOffset++, 20);
    this.dataView.setUint8(byteOffset++, 0);
    this.dataView.setUint8(byteOffset++, 0);
    adjustedHeaderSize += 4;

    //Update Header Length
    this.dataView.setUint8(2, adjustedHeaderSize);

    let ck = 0;
    for (let i = 0; i < byteOffset; i++) {
      ck -= this.dataView.getInt8(i);
    }

    //Add Checksum
    this.dataView.setUint8(byteOffset++, ck & 0xff);

    console.log(
      "Send Identify Unit Packet:" +
        new Uint8Array(this.dataView.buffer, 0, byteOffset),
    );

    return new Uint8Array(this.dataView.buffer, 0, byteOffset);
  }

  stopIdentifyUnit() {
    let byteOffset = 16;
    let adjustedHeaderSize = 0;
    this.createHeaderChunk(this.uIDBroadcastPacket, this.uIDServer);

    //8 random bytes
    for (let i = 0; i < 8; i++) {
      this.dataView.setUint8(byteOffset++, Math.floor(Math.random() * 0));
      adjustedHeaderSize += 1;
    }

    //Set Command
    this.dataView.setUint8(byteOffset++, PacketCmds.CBIN_PACKET_IDENTIFY_MODE);
    adjustedHeaderSize += 1;

    //
    this.dataView.setUint8(byteOffset++, -120);
    this.dataView.setUint8(byteOffset++, 20);
    this.dataView.setUint8(byteOffset++, 0);
    this.dataView.setUint8(byteOffset++, 0);
    adjustedHeaderSize += 4;

    //Update Header Length
    this.dataView.setUint8(2, adjustedHeaderSize);

    let ck = 0;
    for (let i = 0; i < byteOffset; i++) {
      ck -= this.dataView.getInt8(i);
    }

    //Add Checksum
    this.dataView.setUint8(byteOffset++, ck & 0xff);

    console.log(
      "Send Identify Unit Packet:" +
        new Uint8Array(this.dataView.buffer, 0, byteOffset),
    );

    return new Uint8Array(this.dataView.buffer, 0, byteOffset);
  }

  sendGetSensorData() {
    let byteOffset = 16;
    let adjustedHeaderSize = 0;
    this.createHeaderChunk(this.uIDBroadcastPacket, this.uIDServer);

    //8 random bytes
    for (let i = 0; i < 8; i++) {
      this.dataView.setUint8(byteOffset++, Math.floor(Math.random() * 0));
      adjustedHeaderSize += 1;
    }

    //Set Command
    this.dataView.setUint8(byteOffset++, PacketCmds.CBIN_PACKET_GET);
    adjustedHeaderSize += 1;

    //Find matching register values based on hid
    const exposedRegisterMap: Record<number, string[]> = {
      [24]: this.register.exposedSolarChargerReg,
      [25]: this.register.exposedUniversalPSUReg,
      [40]: this.register.exposedACDCReg,
    };

    const exposedRegisters = exposedRegisterMap[this.header.source.hID] ?? [];

    exposedRegisters.forEach((reg) => {
      const foundRegister = this.register.registerMap
        .get(this.header.source.hID)
        ?.find((register) => reg === register.name);

      if (foundRegister) {
        this.dataView.setUint8(byteOffset++, foundRegister.id);
        this.dataView.setUint8(byteOffset++, 0);
        adjustedHeaderSize += 2;
      }
    });

    //Update Header Length
    this.dataView.setUint8(2, adjustedHeaderSize);

    //Create Checksum
    let ck = 0;
    for (let i = 0; i < byteOffset; i++) {
      ck -= this.dataView.getInt8(i);
    }

    this.dataView.setUint8(byteOffset++, ck & 0xff);

    console.log(
      "Send Get Registers Packet:" +
        new Uint8Array(this.dataView.buffer, 0, byteOffset),
    );

    return new Uint8Array(this.dataView.buffer, 0, byteOffset);
  }

  async parsePacket(packet: Uint8Array) {
    console.log("Parsing Packet... ");
    let packetDataView = new DataView(packet.buffer, 0, packet.byteLength);

    console.log("Parsing Header....");
    this.parseHeaderChunk(packetDataView);

    let pckCMD = packet[24];

    if (pckCMD == PacketCmds.CBIN_PACKET_SET_ACK) {
      packet = this.sendGetSensorData();
    }

    // if (pckCMD == PacketCmds.CBIN_PACKET_IDENTIFY_MODE) {
    //   packet = this.sendGetSensorData();
    // }

    if (pckCMD == PacketCmds.CBIN_PACKET_GET_DATA) {
      packet = this.parseRegisterData(packetDataView);
    }

    return packet;
  }

  /**
   * This function creates the header portion of the packet.
   */
  createHeaderChunk(destinationPacket: CUID, sourcePacket: CUID): void {
    let byteOffset = 0;

    //Signature (2 bytes)
    this.dataView.setUint16(byteOffset, this.header.signature);
    byteOffset += 2;

    //Set default length
    this.dataView.setUint8(byteOffset++, this.header.length);
    this.dataView.setUint8(byteOffset++, 0x00);

    //Destination (6 bytes)
    this.dataView.setUint8(byteOffset++, destinationPacket.fID);
    this.dataView.setUint8(byteOffset++, destinationPacket.hID);
    this.dataView.setUint32(byteOffset, destinationPacket.serNum, true);
    byteOffset += 4;

    //Source (6 bytes)
    this.dataView.setUint8(byteOffset++, sourcePacket.fID);
    this.dataView.setUint8(byteOffset++, sourcePacket.hID);
    this.dataView.setUint32(byteOffset, sourcePacket.serNum, true);
    byteOffset += 4;
  }

  parseHeaderChunk(dataView: DataView) {
    let byteOffset = 0;

    //Signature (2 bytes)
    this.header.signature = dataView.getUint16(byteOffset);
    byteOffset += 2;

    //Length (2 bytes)
    this.header.length = dataView.getUint16(byteOffset, true);
    byteOffset += 2;

    //Destination (6 bytes)
    this.header.destination.fID = dataView.getUint8(byteOffset++);
    this.header.destination.hID = dataView.getUint8(byteOffset++);
    this.header.destination.serNum = dataView.getUint32(byteOffset, true);
    byteOffset += 4;

    //Source (6 bytes)
    this.header.source.fID = dataView.getUint8(byteOffset++);
    this.header.source.hID = dataView.getUint8(byteOffset++);
    this.header.source.serNum = dataView.getUint32(byteOffset, true);
    byteOffset += 4;
  }

  parseRegisterData(packet: DataView) {
    let byteOffset = 16 + 8 + 1;
    let data = [];

    for (let i = byteOffset; i < this.header.length + 16; ) {
      const registerID = packet.getUint16(i, true);
      i += 2;
      const registerByteLength = packet.getUint8(i++);

      let registerValue = 0;
      switch (registerByteLength) {
        case 1:
          registerValue = packet.getUint8(i);
          i += 1;
          break;

        case 2:
          registerValue = packet.getUint16(i, true);
          i += 2;
          break;

        case 4:
          registerValue = packet.getUint32(i, true);
          i += 4;
          break;

        default:
          throw new Error(`Unsupported register size: ${registerByteLength}`);
      }

      const parsedReg = this.register.parseRegister(
        this.header.source.hID,
        registerID,
        registerByteLength,
        registerValue,
      );
      data.push(parsedReg);
    }

    return this.sendGetSensorData()
  }

  logHeaderDetails() {
    console.log(`Signature: ${this.header.signature}`);
    console.log(`Header Length: ${this.header.length}`);
    console.log(`Destination fID: ${this.header.destination.fID}`);
    console.log(`Destination hID: ${this.header.destination.hID}`);
    console.log(`Destination serNum: ${this.header.destination.serNum}`);

    console.log(`Source fID: ${this.header.source.fID}`);
    console.log(`Source hID: ${this.header.source.hID}`);
    console.log(`Source serNum: ${this.header.source.serNum}`);
  }
}
