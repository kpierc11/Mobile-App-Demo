interface CUID {
    fID: number,
    hID: number,
    serNum: number,
}



export class Packet {
    header: {
        signature: number,
        length: number,
        destination: CUID,
        source: CUID
    };

    buffer: Uint8Array;

    


    constructor() {
        this.header = { signature: 0xC2B2, length: 0, destination: { fID: 0, hID: 0, serNum: 0 }, source: { fID: 0, hID: 0, serNum: 0 } };
        this.buffer = new Uint8Array([]);
    };



}