import { create } from "zustand";

type MAStore = {
  data: any[];
  setData: (d: any[]) => void;
};

export const useMAStore = create<MAStore>((set) => ({
  data: [],
  setData: (d) => set({ data: d }),
}));