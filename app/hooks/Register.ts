interface RegisterData {
  name: string;
  id: number;
  byteCount: number;
}

interface ParsedRegisterData {
  registerName: string;
  value: any;
}

export class Register {
  name: string;
  id: number;
  byteCount: number;
  registerMap = new Map<number, RegisterData[]>();
  exposedSolarChargerReg: string[] = [];
  exposedUniversalPSUReg: string[] = [];
  exposedACDCReg: string[] = [];
  currentRegisterData = new Array<ParsedRegisterData>();

  constructor() {
    this.name = "";
    this.id = 0;
    this.byteCount = 0;
    this.registerMap.set(24, [
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

    this.registerMap.set(25, [
      { name: "Time", id: 1, byteCount: 4 },
      { name: "Schedule", id: 2, byteCount: 36 },
      { name: "Pause", id: 3, byteCount: 4 },

      { name: "Sonic Power", id: 4, byteCount: 1 },

      { name: "Sonic Voltage", id: 5, byteCount: 4 },
      { name: "Internal Temperature (C)", id: 6, byteCount: 4 },

      { name: "Sonic 1 Status", id: 7, byteCount: 1 },
      { name: "Sonic 2 Status", id: 8, byteCount: 1 },
    ]);

    this.registerMap.set(40, [
      { name: "Time", id: 1, byteCount: 4 },
      { name: "Schedule", id: 2, byteCount: 36 },
      { name: "Pause", id: 3, byteCount: 4 },

      { name: "Sonic Power", id: 4, byteCount: 1 },

      { name: "Input Voltage", id: 5, byteCount: 4 },
      { name: "Internal Temperature (C)", id: 6, byteCount: 4 },
      { name: "Sonic 1 Voltage", id: 7, byteCount: 4 },
      { name: "Sonic 2 Voltage", id: 8, byteCount: 4 },

      { name: "Sonic 1 Status", id: 9, byteCount: 1 },
      { name: "Sonic 2 Status", id: 10, byteCount: 1 },
    ]);

    this.exposedSolarChargerReg = [
      "Battery Voltage",
      "Internal Temperature (C)",
      "Sonic 1 Status",
      "Sonic 1 Voltage",
      "Sonic 2 Status",
      "Sonic 2 Voltage",
      "Sonic Power",
    ];
    this.exposedUniversalPSUReg = [
      "Sonic Power",
      "Internal Temperature (C)",
      "Sonic Voltage",
      "Sonic 1 Status",
      "Sonic 2 Status",
    ];
    this.exposedACDCReg = [
      "Sonic Power",
      "Internal Temperature (C)",
      "Input voltage",
      "Sonic 1 Voltage",
      "Sonic 2 Voltage",
      "Sonic 1 Status",
      "Sonic 2 Status",
    ];
  }

  parseRegister(
    hID: number,
    registerID: number,
    registerByteLength: number,
    data: any,
  ) {
    const reg = this.registerMap
      .get(hID)
      ?.find((register) => register.id == registerID);

    console.log({ registerName: reg?.name, value: data });

    if (!reg) return;

    let formattedValue: string | number = data;

    if (data === 0 && !reg.name.includes("Voltage")) {
      formattedValue = "Disabled";
    } else if (data === 1) {
      formattedValue = "Enabled";
    } else if (reg.name.includes("Temperature")) {
      formattedValue = (data / 100).toFixed(2) + " (c)";
    } else if (reg.name.includes("Voltage")) {
      formattedValue = (data / 1000).toFixed(3) + " (v)";
    }

    return { registerName: reg?.name, value: formattedValue, hardwareID: hID };
  }
}
