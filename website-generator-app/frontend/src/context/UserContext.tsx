"use client";

import { createContext, useContext } from "react";

export interface UserData {
  username: string;
  email: string;
  avatar: any;
}

interface UserContextType {
  user: UserData;
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
