let devicesAlias: Record<string, string> = {};

export default function UseAliasNaming() {
  function addAlias(deviceID: string, alias: string | undefined) {
    if (!alias) return;

    devicesAlias[deviceID] = alias;
  }

  function getLatestAlias(deviceID: string) {
    return devicesAlias[deviceID];
  }

  return { devicesAlias, addAlias, getLatestAlias };
}
