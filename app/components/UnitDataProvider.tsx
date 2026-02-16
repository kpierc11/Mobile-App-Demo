import { ParsedRegisterData } from "@/interfaces/parsedRegisterData";
import { createContext, useState, ReactNode } from "react";

type UnitDataContextType = {
  unitData: ParsedRegisterData[];
  setUnitData: (data: ParsedRegisterData[]) => void;
};

export const UnitDataContext = createContext<UnitDataContextType>({
  unitData: [],
  setUnitData: () => {},
});

export default function UnitDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [unitData, setUnitData] = useState<ParsedRegisterData[]>([]);

  return (
    <UnitDataContext value={{ unitData, setUnitData }}>
      {children}
    </UnitDataContext>
  );
}
