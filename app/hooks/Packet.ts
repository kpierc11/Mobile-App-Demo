interface CUID {
  fID: number;
  hID: number;
  serNum: number;
}

enum PacketCmds {
  CBIN_PACKET_GET = 1,
  CBIN_PACKET_SET = 2,
  CBIN_PACKET_GET_DATA = 3,
  CBIN_PACKET_SET_ACK = 4,
  CBIN_PACKET_IDENTIFY_MODE = 20,
}

interface Register {
  name: string;
  id: number;
  byteCount: number;
}

const registers = new Map<number, Register[]>();
registers.set(24, [
  { name: "Time", id: 1, byteCount: 4 },
  { name: "Schedule", id: 2, byteCount: 36 },
  { name: "Pause", id: 3, byteCount: 4 },

  { name: "Sonic Power", id: 4, byteCount: 1 },

  { name: "Battery Voltage", id: 5, byteCount: 4 },
  { name: "Battery Charge Current", id: 6, byteCount: 4 },

  { name: "Solar Panel Voltage", id: 7, byteCount: 4 },
  { name: "Sonic 1 Voltage", id: 8, byteCount: 4 },
  { name: "Sonic 2 Voltage", id: 9, byteCount: 4 },

  { name: "Internal Temperature (C)", id: 10, byteCount: 4 },
  { name: "External Temperature (C)", id: 11, byteCount: 4 },

  { name: "Battery Load Current", id: 12, byteCount: 4 },

  { name: "Sonic 1 Status", id: 13, byteCount: 1 },
  { name: "Sonic 2 Status", id: 14, byteCount: 1 },
]);

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
  }

  /**
   * This function creates the set time packet that is initially sent on connection to the solar controller via BLE
   * @returns Uint8Array
   */
  sendSetTimePacket(): Uint8Array {
    let byteOffset = this.header.length;

    this.createHeaderChunk(this.uIDBroadcastPacket, this.uIDServer);

    //8 random bytes
    for (let i = 0; i < 8; i++) {
      this.dataView.setUint8(byteOffset++, Math.floor(Math.random() * 0));
    }

    //Set Command
    this.dataView.setUint8(byteOffset++, PacketCmds.CBIN_PACKET_SET);

    //Set Time
    //register ID for time
    this.dataView.setUint8(byteOffset++, 1);
    this.dataView.setUint8(byteOffset++, 0);

    //Number of bytes for the time value
    this.dataView.setUint8(byteOffset++, 4);

    //the time
    this.dataView.setUint8(byteOffset++, -113);
    this.dataView.setUint8(byteOffset++, 3);
    this.dataView.setUint8(byteOffset++, 0);
    this.dataView.setUint8(byteOffset++, 0);

    let ck = 0;
    console.log("byte length:");
    for (let i = 0; i < 33; i++) {
      ck -= this.dataView.getInt8(i);
    }

    console.log(ck);
    //Add Checksum
    this.dataView.setUint8(byteOffset++, ck & 0xff);

    this.logHeaderDetails();

    console.log(
      "Send Packet:" + new Uint8Array(this.dataView.buffer, 0, byteOffset),
    );

    return new Uint8Array(this.dataView.buffer, 0, byteOffset);
  }

  sendIdentifyUnitPacket() {
    let byteOffset = this.header.length;

    this.createHeaderChunk(this.uIDIdentityPacket, this.uIDServer);

    //8 random bytes
    for (let i = 0; i < 8; i++) {
      this.dataView.setUint8(byteOffset++, Math.floor(Math.random() * 0));
    }

    //Set Command
    this.dataView.setUint8(byteOffset++, PacketCmds.CBIN_PACKET_IDENTIFY_MODE);

    // //Set Time
    // //register ID for time
    // this.dataView.setUint8(byteOffset++, 1);
    // this.dataView.setUint8(byteOffset++, 0);

    // //Number of bytes for the time value
    // this.dataView.setUint8(byteOffset++, 4);

    // //the time
    // this.dataView.setUint8(byteOffset++, -113);
    // this.dataView.setUint8(byteOffset++, 3);
    // this.dataView.setUint8(byteOffset++, 0);
    // this.dataView.setUint8(byteOffset++, 0);

    //Add Checksum
    this.dataView.setUint8(byteOffset++, 19);

    //this.logHeaderDetails();

    //console.log("Send Packet:" + new Uint8Array(this.dataView.buffer, 0, byteOffset))

    return new Uint8Array(this.dataView.buffer, 0, byteOffset);
  }

  getInitialData() {}

  parsePacket(packet: Uint8Array) {
    console.log("Parsing Packet... ");
    console.log("Packet byte length:" + packet.byteLength);
    this.dataView = new DataView(packet.buffer, 0, packet.byteLength);

    let byteOffset = this.header.length + 8 + 1;

    console.log("Parsing Header....");
    this.parseHeaderChunck();

    //this.logHeaderDetails();

    const data = this.dataView.buffer.slice(byteOffset);

    console.log(data.byteLength);

    for (let i = 0; i < data.byteLength; i++) {}

    //const currentRegister = registers.get(this.header.source.hID)?.find(register => register.id ==  );

    // const batteryVoltageRegID = this.dataView.getUint16(byteOffset, true);
    // byteOffset += 2;

    // const batteryVoltageByteLength = this.dataView.getUint8(byteOffset++);
    // const batteryVoltage = this.dataView.getUint32(byteOffset, true);
    // byteOffset += 4;

    // const tempRegisterID = this.dataView.getUint16(byteOffset, true);
    // byteOffset += 2;
    // const tempByteLength = this.dataView.getUint8(byteOffset++);
    // const temperature = this.dataView.getUint32(byteOffset, true);
    // byteOffset += 4;

    // console.log("Battery Register id: " + batteryVoltageRegID);
    // console.log("Battery voltage: " + batteryVoltage / 1000);
    // const batteryV = batteryVoltage / 1000;

    // console.log("Temperature id: " + tempRegisterID);
    // console.log("Temperature: " + temperature / 100);
    // const temp = temperature / 100;

    return {}; //{ batteryVoltage: batteryV, temp: temp };
  }

  /**
   * This function creates the header portion of the packet.
   */
  createHeaderChunk(destinationPacket: CUID, sourcePacket: CUID): void {
    let byteOffset = 0;

    //Signature (2 bytes)
    const sig = this.header.signature;
    this.dataView.setUint16(byteOffset, sig);
    byteOffset += 2;

    //Length (2 bytes)
    this.dataView.setUint8(byteOffset++, this.header.length);
    this.dataView.setUint8(byteOffset++, 0x00);

    console.log(destinationPacket.serNum);
    //Destination (6 bytes)
    this.dataView.setUint8(byteOffset++, destinationPacket.fID);
    this.dataView.setUint8(byteOffset++, destinationPacket.hID);
    this.dataView.setUint32(byteOffset, destinationPacket.serNum);
    byteOffset += 4;

    //Source (6 bytes)
    this.dataView.setUint8(byteOffset++, sourcePacket.fID);
    this.dataView.setUint8(byteOffset++, sourcePacket.hID);
    this.dataView.setUint32(byteOffset, sourcePacket.serNum);
    byteOffset += 4;
  }

  parseHeaderChunck() {
    let byteOffset = 0;

    //Signature (2 bytes)
    this.header.signature = this.dataView.getUint16(byteOffset, true);
    byteOffset += 2;

    //Length (2 bytes)
    this.header.length = this.dataView.getUint16(byteOffset, true);
    byteOffset += 2;

    //Destination (6 bytes)
    this.header.destination.fID = this.dataView.getUint8(byteOffset++);
    this.header.destination.hID = this.dataView.getUint8(byteOffset++);
    this.header.destination.serNum = this.dataView.getUint32(byteOffset, true);
    byteOffset += 4;

    //Source (6 bytes)
    this.header.source.fID = this.dataView.getUint8(byteOffset++);
    this.header.source.hID = this.dataView.getUint8(byteOffset++);
    this.header.source.serNum = this.dataView.getUint32(byteOffset, true);
    byteOffset += 4;
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
