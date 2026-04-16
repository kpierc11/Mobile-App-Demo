import { ParsedRegisterData } from "../types/parsedRegisterData";
import { createContext, useState, ReactNode } from "react";

type UnitDataContextType = {
  unitData: ParsedRegisterData[];
  unitHID: number;
  setUnitHID: (hardwareID: number) => void;
  setUnitData: (data: ParsedRegisterData[]) => void;
};

export const UnitDataContext = createContext<UnitDataContextType>({
  unitData: [],
  unitHID: 0,
  setUnitHID: () => {},
  setUnitData: () => {},
});

export default function UnitDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [unitData, setUnitData] = useState<ParsedRegisterData[]>([]);
  const [unitHID, setUnitHID] = useState<number>(0);

  return (
    <UnitDataContext
      value={{
        unitData,
        setUnitData,
        unitHID,
        setUnitHID
      }}
    >
      {children}
    </UnitDataContext>
  );
}
