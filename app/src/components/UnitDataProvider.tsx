import { ParsedRegisterData } from "../types/parsedRegisterData";
import { createContext, useState, ReactNode } from "react";

type UnitDataContextType = {
  unitData: ParsedRegisterData[];
  unitHID: number;
  unitSchedule: any[];
  setUnitHID: (hardwareID: number) => void;
  setUnitData: (data: ParsedRegisterData[]) => void;
  setUnitSchedule: (schedule: any[]) => void;
};

export const UnitDataContext = createContext<UnitDataContextType>({
  unitData: [],
  unitHID: 0,
  unitSchedule: [],
  setUnitHID: () => {},
  setUnitData: () => {},
  setUnitSchedule: () => {},
});

export default function UnitDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [unitData, setUnitData] = useState<ParsedRegisterData[]>([]);
  const [unitHID, setUnitHID] = useState<number>(0);
  const [unitSchedule, setUnitSchedule] = useState<any>([]);

  return (
    <UnitDataContext
      value={{
        unitData,
        setUnitData,
        unitHID,
        setUnitHID,
        unitSchedule,
        setUnitSchedule,
      }}
    >
      {children}
    </UnitDataContext>
  );
}
