"use client";

import { createContext, useContext } from "react";

interface UserContextType {
  username: string;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

// Return the context value of whatever the provider gave
export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used inside UserContext.Provider");
  }
  return ctx;
};
