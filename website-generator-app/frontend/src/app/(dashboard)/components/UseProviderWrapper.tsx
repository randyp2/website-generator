"use client";

import { UserContext } from "@/context/UserContext";

export default function UserProviderWrapper({
  children,
  username,
}: {
  children: React.ReactNode;
  username: string;
}) {
  return (
    <UserContext.Provider value={{ username }}>
      {children}
    </UserContext.Provider>
  );
}
