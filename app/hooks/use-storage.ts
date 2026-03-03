import * as SecureStore from "expo-secure-store";

export const SettingsStore = {
  async save(key: string, value: string) {
    await SecureStore.setItemAsync(key, value);
  },

  async getValueFor(key: string) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
      return result;
    } else {
      return ""
    }
  },
};
