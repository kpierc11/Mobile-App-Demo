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

  constructor() {
    this.uIDServer = { fID: 0x00, hID: 0x00, serNum: 0x00000001 };
    this.uIDIdentityPacket = { fID: 0x00, hID: 0x00, serNum: 0x0000001f };
    this.uIDBroadcastPacket = { fID: 0x00, hID: 0x00, serNum: 0x00001fff };

    this.header = {
      signature: 0xb2c2,
      length: 16,
      source: { fID: 0, hID: 0, serNum: 0 },
      destination: { fID: 0, hID: 0, serNum: 0 },
    };
    this.buffer = new ArrayBuffer(250);
    this.dataView = new DataView(this.buffer);
  }

  createPacket(): void {
    console.log(`Byte Length of Data View: ${this.dataView.byteLength}`);

    let byteOffset = 0;

    //Signature (2 bytes)
    const sig = this.header.signature;
    this.dataView.setUint8(byteOffset++, (sig >> 8) & 0xff);
    this.dataView.setUint8(byteOffset++, sig & 0xff);

    //Length (2 bytes)
    this.dataView.setUint8(byteOffset++, this.header.length);
    this.dataView.setUint8(byteOffset++, 0x00);

    //Destination (6 bytes)
    const { fID, hID, serNum } = this.uIDBroadcastPacket;
    this.dataView.setUint8(byteOffset++, fID);
    this.dataView.setUint8(byteOffset++, hID);
    this.dataView.setUint32(byteOffset++, serNum);
    // byteOffset += 4;

    //Source (6 bytes)
    const src = this.uIDServer;
    this.dataView.setUint8(byteOffset++, src.fID);
    this.dataView.setUint8(byteOffset++, src.hID);
    this.dataView.setUint32(byteOffset++, src.serNum);
    // byteOffset += 4;



    const numArray = new Uint8Array(this.dataView.buffer);
    console.log(numArray);
  }

  parsePacket(): void {

  }
}
