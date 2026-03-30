import { Register } from "./Register";

interface CUID {
  fID: number;
  hID: number;
  serNum: number;
}

export enum PacketTypes {
  SET_TIME,
  ACK_KNOWLEDGE,
  IDENTIFY,
  GET_SENSOR_DATA,
  PARSE_SENSOR_DATA,
  QUATTRO_SCHEDULE,
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
    this.resetBuffer();
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

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Convert to total minutes
    const totalMinutes = hours * 60 + minutes;

    // Write as 4 bytes: 2-byte little-endian total minutes + 2-byte padding
    this.dataView.setUint16(byteOffset, totalMinutes, true);
    byteOffset += 2;
    this.dataView.setUint16(byteOffset, 0, true);
    byteOffset += 2;
    adjustedHeaderSize += 7;

    //Update Header Length
    this.dataView.setUint8(2, adjustedHeaderSize);

    let ck = 0;
    for (let i = 0; i < byteOffset; i++) {
      ck -= this.dataView.getInt8(i);
    }

    //Add Checksum
    this.dataView.setUint8(byteOffset++, ck & 0xff);

    return new Uint8Array(this.dataView.buffer, 0, byteOffset);
  }

  /**
   * Sends an Identify packet to the unit. The light should blink several times.
   * @returns Uint8Array
   */
  sendIdentifyUnit() {
    this.resetBuffer();
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

    return new Uint8Array(this.dataView.buffer, 0, byteOffset);
  }

  /**
   * Sends a stop identify packet to shut off the identify mode.
   * @returns Uint8Array
   */
  sendStopIdentifyUnit() {
    this.resetBuffer();
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
    this.dataView.setUint8(byteOffset++, 0);
    this.dataView.setUint8(byteOffset++, 0);
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

    return new Uint8Array(this.dataView.buffer, 0, byteOffset);
  }

  /**
   * Sends a packet to set an alias name for the device.
   * @returns Uint8Array
   */
  sendSetAlias(alias: string) {
    this.resetBuffer();
    let byteOffset = 16;
    let adjustedHeaderSize = 0;
    this.createHeaderChunk(this.uIDBroadcastPacket, this.uIDServer);
    const maxStringSize = 19;

    //8 random bytes
    for (let i = 0; i < 8; i++) {
      this.dataView.setUint8(byteOffset++, Math.floor(Math.random() * 0));
      adjustedHeaderSize += 1;
    }

    //Set Command
    this.dataView.setUint8(byteOffset++, PacketCmds.CBIN_PACKET_SET);
    adjustedHeaderSize += 1;

    //Set alias
    const asciiCodes = Array.from(alias).map((char) => char.charCodeAt(0));

    for (let i = 0; i <= maxStringSize; i++) {
      let value = asciiCodes[i];
      if (value) {
        this.dataView.setUint8(byteOffset++, value);
      } else {
        this.dataView.setUint8(byteOffset++, 0);
      }
      adjustedHeaderSize += 1;
    }

    //Update Header Length
    this.dataView.setUint8(2, adjustedHeaderSize);

    let ck = 0;
    for (let i = 0; i < byteOffset; i++) {
      ck -= this.dataView.getInt8(i);
    }

    //Add Checksum
    this.dataView.setUint8(byteOffset++, ck & 0xff);

    return new Uint8Array(this.dataView.buffer, 0, byteOffset);
  }

  /**
   * Sends a packet to turns on the quattro heads
   * @returns Uint8Array
   */
  sendTurnOnQuattros() {
    this.resetBuffer();
    let byteOffset = 16;
    let adjustedHeaderSize = 0;
    this.createHeaderChunk(this.uIDBroadcastPacket, this.uIDServer);
    const maxStringSize = 19;

    //8 random bytes
    for (let i = 0; i < 8; i++) {
      this.dataView.setUint8(byteOffset++, Math.floor(Math.random() * 0));
      adjustedHeaderSize += 1;
    }

    //Set Command
    this.dataView.setUint8(byteOffset++, PacketCmds.CBIN_PACKET_SET);
    adjustedHeaderSize += 1;

    //Set Register ID and byte size
    this.dataView.setUint8(byteOffset++, 2);
    this.dataView.setUint8(byteOffset++, 0);
    this.dataView.setUint8(byteOffset++, 36);
    adjustedHeaderSize += 3;

    for (let i = 0; i <= 36; i++) {
      this.dataView.setUint8(byteOffset++, 255);
      adjustedHeaderSize += 1;
    }

    //Update Header Length
    this.dataView.setUint8(2, adjustedHeaderSize);

    let ck = 0;
    for (let i = 0; i < byteOffset; i++) {
      ck -= this.dataView.getInt8(i);
    }

    //Add Checksum
    this.dataView.setUint8(byteOffset++, ck & 0xff);

    return new Uint8Array(this.dataView.buffer, 0, byteOffset);
  }

  /**
   * Sends a packet to turn off the quattro heads
   * @returns Uint8Array
   */
  sendTurnOffQuattros() {
    this.resetBuffer();
    let byteOffset = 16;
    let adjustedHeaderSize = 0;
    this.createHeaderChunk(this.uIDBroadcastPacket, this.uIDServer);
    const maxStringSize = 19;

    //8 random bytes
    for (let i = 0; i < 8; i++) {
      this.dataView.setUint8(byteOffset++, Math.floor(Math.random() * 0));
      adjustedHeaderSize += 1;
    }

    //Set Command
    this.dataView.setUint8(byteOffset++, PacketCmds.CBIN_PACKET_SET);
    adjustedHeaderSize += 1;

    //Set Register ID and byte size
    this.dataView.setUint8(byteOffset++, 2);
    this.dataView.setUint8(byteOffset++, 0);
    this.dataView.setUint8(byteOffset++, 36);
    adjustedHeaderSize += 3;

    for (let i = 0; i <= 36; i++) {
      this.dataView.setUint8(byteOffset++, 0);
      adjustedHeaderSize += 1;
    }

    //Update Header Length
    this.dataView.setUint8(2, adjustedHeaderSize);

    let ck = 0;
    for (let i = 0; i < byteOffset; i++) {
      ck -= this.dataView.getInt8(i);
    }

    //Add Checksum
    this.dataView.setUint8(byteOffset++, ck & 0xff);

    return new Uint8Array(this.dataView.buffer, 0, byteOffset);
  }

  /**
   * Sends a packet to return the current Quattro Schedule
   * @returns Uint8Array
   */
  sendGetQuattroSchedule() {
    this.resetBuffer();
    let byteOffset = 16;
    let adjustedHeaderSize = 0;
    this.createHeaderChunk(this.uIDBroadcastPacket, this.uIDServer);
    const maxStringSize = 19;

    //8 random bytes
    for (let i = 0; i < 8; i++) {
      this.dataView.setUint8(byteOffset++, Math.floor(Math.random() * 0));
      adjustedHeaderSize += 1;
    }

    //Set Command
    this.dataView.setUint8(byteOffset++, PacketCmds.CBIN_PACKET_GET);
    adjustedHeaderSize += 1;

    //Set Register ID and byte size
    this.dataView.setUint8(byteOffset++, 2);
    this.dataView.setUint8(byteOffset++, 0);
    this.dataView.setUint8(byteOffset++, 36);
    adjustedHeaderSize += 3;

    // for (let i = 0; i <= 36; i++) {
    //   this.dataView.setUint8(byteOffset++, 0);
    //   adjustedHeaderSize += 1;
    // }

    //Update Header Length
    this.dataView.setUint8(2, adjustedHeaderSize);

    let ck = 0;
    for (let i = 0; i < byteOffset; i++) {
      ck -= this.dataView.getInt8(i);
    }

    //Add Checksum
    this.dataView.setUint8(byteOffset++, ck & 0xff);

    return new Uint8Array(this.dataView.buffer, 0, byteOffset);
  }

   /**
   * Sends a packet to return the current Quattro Schedule
   * @returns Uint8Array
   */
  sendSetQuattroSchedule() {
    this.resetBuffer();
    let byteOffset = 16;
    let adjustedHeaderSize = 0;
    this.createHeaderChunk(this.uIDBroadcastPacket, this.uIDServer);
    const maxStringSize = 19;

    //8 random bytes
    for (let i = 0; i < 8; i++) {
      this.dataView.setUint8(byteOffset++, Math.floor(Math.random() * 0));
      adjustedHeaderSize += 1;
    }

    //Set Command
    this.dataView.setUint8(byteOffset++, PacketCmds.CBIN_PACKET_SET);
    adjustedHeaderSize += 1;

    //Set Register ID and byte size
    this.dataView.setUint8(byteOffset++, 2);
    this.dataView.setUint8(byteOffset++, 0);
    this.dataView.setUint8(byteOffset++, 36);
    adjustedHeaderSize += 3;

    for (let i = 0; i <= 36; i++) {
      this.dataView.setUint8(byteOffset++, 0);
      adjustedHeaderSize += 1;
    }

    //Update Header Length
    this.dataView.setUint8(2, adjustedHeaderSize);

    let ck = 0;
    for (let i = 0; i < byteOffset; i++) {
      ck -= this.dataView.getInt8(i);
    }

    //Add Checksum
    this.dataView.setUint8(byteOffset++, ck & 0xff);

    return new Uint8Array(this.dataView.buffer, 0, byteOffset);
  }

  /**
   * The registers that are available for the device are determined by the hid.
   * This checks the current hid and finds the available registers located in the register class.
   * Once found, a packet is built to request the registers from the firmware.
   * @returns Uint8Array
   */
  sendGetSensorData() {
    this.resetBuffer();
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

    return new Uint8Array(this.dataView.buffer, 0, byteOffset);
  }

  /**
   * Takes in a packet to parse.
   * The set time packet is the first initial packet sent on ble connection.
   * This take the response packet and determines what type of packet to send in response based on CMD in the header portion.
   * @param packet
   * @returns
   */
  async parsePacket(packet: Uint8Array) {
    let packetDataView: DataView | null = new DataView(
      packet.buffer,
      0,
      packet.byteLength,
    );

    this.parseHeaderChunk(packetDataView);

    let pckCMD = packet[24];
    let registerID = packet[25];
    console.log("Register ID", registerID);
    let packetType: PacketTypes = PacketTypes.SET_TIME;
    let parsedRegData: any = [];

    if (pckCMD == PacketCmds.CBIN_PACKET_SET_ACK) {
      packetType = PacketTypes.ACK_KNOWLEDGE;
    }

    if (pckCMD == PacketCmds.CBIN_PACKET_SET) {
      packetType = PacketTypes.ACK_KNOWLEDGE;
    }

    if (pckCMD == PacketCmds.CBIN_PACKET_IDENTIFY_MODE) {
      packetType = PacketTypes.IDENTIFY;
    }

    if (pckCMD == PacketCmds.CBIN_PACKET_GET_DATA && registerID != 2) {
      packetType = PacketTypes.PARSE_SENSOR_DATA;
    } else {
      packetType = PacketTypes.QUATTRO_SCHEDULE;
    }

    return { type: packetType, currentPacket: packet, regData: parsedRegData };
  }

  /**
   * This function creates the header portion of the packet.
   */
  createHeaderChunk(destinationPacket: CUID, sourcePacket: CUID): void {
    let byteOffset = 0;

    // //Reset Header before setting new values.
    // this.header = {
    //   signature: 0xb2c2,
    //   length: 16,
    //   destination: { fID: 0, hID: 0, serNum: 0 },
    //   source: { fID: 0, hID: 0, serNum: 0 },
    // };

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

  /**
   * This function parses the header chunk for incoming packets and sets the state of the
   * signature, length, source and destination.
   */
  parseHeaderChunk(dataView: DataView) {
    let byteOffset = 0;

    this.dataView;

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

  /**
   * Parses the return packet that is recieved from sending the sendGetSensors function.
   * Creates
   * @param packet
   * @returns
   */
  parseRegisterData(packet: DataView) {
    let byteOffset = 16 + 8 + 1;
    let regData = [];

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
        // throw new Error(`Unsupported register size: ${registerByteLength}`);
      }

      const parsedReg = this.register.parseRegister(
        this.header.source.hID,
        registerID,
        registerByteLength,
        registerValue,
      );
      regData.push(parsedReg);
    }

    return { newPacket: new Uint8Array(), registerData: regData };
  }

  parseQuattroSchedule(packet: Uint8Array) {

    
  }

  resetBuffer() {
    this.buffer = new ArrayBuffer(250);
    this.dataView = new DataView(this.buffer);
  }
}
