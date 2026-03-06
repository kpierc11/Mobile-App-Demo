import { ParsedRegisterData } from "../types/parsedRegisterData";
import { createContext, useState, ReactNode } from "react";
 
type UnitDataContextType = {
  unitData: ParsedRegisterData[];
  unitImageURL: string;
  setUnitImageURL: (imageURL: string) => void;
  setUnitData: (data: ParsedRegisterData[]) => void;
};

export const UnitDataContext = createContext<UnitDataContextType>({
  unitData: [],
  unitImageURL: "",
  setUnitImageURL: () => {},
  setUnitData: () => {},
});

export default function UnitDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [unitData, setUnitData] = useState<ParsedRegisterData[]>([]);
  const [unitImageURL, setUnitImageURL] = useState<string>("");

  return (
    <UnitDataContext
      value={{ unitData, setUnitData, unitImageURL, setUnitImageURL }}
    >
      {children}
    </UnitDataContext>
  );
}
