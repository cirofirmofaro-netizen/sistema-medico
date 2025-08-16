import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const KEY = 'settings_aliquota';

type SettingsState = {
  aliquota: number; // 0.06 = 6%
  setAliquota: (v: number) => void;
  hydrate: () => Promise<void>;
};

export const useSettings = create<SettingsState>((set, get) => ({
  aliquota: 0.06,
  setAliquota: (v: number) => {
    const val = Math.max(0, Math.min(1, v));
    set({ aliquota: val });
    SecureStore.setItemAsync(KEY, String(val)).catch(() => {});
  },
  hydrate: async () => {
    try {
      const saved = await SecureStore.getItemAsync(KEY);
      if (saved != null) set({ aliquota: Number(saved) || 0.06 });
    } catch {}
  },
}));
