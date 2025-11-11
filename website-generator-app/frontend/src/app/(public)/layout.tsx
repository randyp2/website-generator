"use client";

import React from "react";
import Navbar from "@/components/navbar/Navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Shared public navigation */}
      <Navbar />
      
      {/* Page content */}
      <main className="flex-1">{children}</main>
    </>
  );
}
