import { useEffect, useState } from "react";

export default function UseAliasNaming() {
  const [devicesAlias, setDevicesAlias] = useState<Record<string, string>>({});

  useEffect(() => {
    Object.entries(devicesAlias).map(([key, value]) => {
      console.log(key);
      console.log(value);
    });
  }, []);

  async function setInitialAliasNames() {}

  function updateAlias(deviceID: string, alias: string | undefined) {
    if (!alias) {
      return;
    }
    setDevicesAlias((prev) => ({
      ...prev,
      [deviceID]: alias,
    }));
  }

  function getLatestAlias(deviceID: string) {
    const latestAlias = devicesAlias[deviceID] ?? undefined;

    console.log(deviceID);
    console.log(latestAlias);

    return latestAlias;
  }

  return { devicesAlias, updateAlias, getLatestAlias };
}
