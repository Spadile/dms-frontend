"use client";
import { create } from "zustand";

export const useStore = create((set) => ({
  user: {},

  // User Data
  updateUser: (newData) => {
    set({ user: newData });
  },
}));
