import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("nexcall-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("nexcall-theme", theme);
    set({ theme });
  },
}));