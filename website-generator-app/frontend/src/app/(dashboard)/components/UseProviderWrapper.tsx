"use client";

import { UserContext, UserData } from "@/context/UserContext";

export default function UserProviderWrapper({
  children,
  user,
}: {
  children: React.ReactNode;
  user: UserData;
}) {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}
