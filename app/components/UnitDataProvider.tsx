import { createContext, useState, ReactNode } from "react";

type UnitDataContextType = {
  unitData: Map<string, number>;
  setUnitData: (data: Map<string, number>) => void;
};

export const UnitDataContext = createContext<UnitDataContextType>({
  unitData: new Map<string, number>(),
  setUnitData: () => {},
});

export default function UnitDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [unitData, setUnitData] = useState<Map<string, number>>(
    new Map<string, number>(),
  );

  return (
    <UnitDataContext value={{ unitData, setUnitData }}>
      {children}
    </UnitDataContext>
  );
}
