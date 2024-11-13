"use client";
import { create } from "zustand";

export const useStore = create((set) => ({
  user: {},
  employee: {},
  isFileExist: false,

  // User Data
  updateUser: (newData) => {
    set({ user: newData });
  },

  updateEmployee: (newData) => {
    set({ employee: newData });
  },
  updateIsFileExist: (newData) => {
    set({ isFileExist: newData });
  },
}));
