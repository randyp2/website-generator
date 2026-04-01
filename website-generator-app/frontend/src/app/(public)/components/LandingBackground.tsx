"use client";

import Silk from "@/components/Silk";
import { useTheme } from "next-themes";
import * as React from "react";

export function LandingBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div className="landing-rebrand-silk" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-[72rem] w-full scale-110">
        <Silk
          speed={5}
          scale={0.95}
          color={isDark ? "#050a72" : "#0b168f"}
          backgroundColor={isDark ? "#000000" : "#ffffff"}
          useBackgroundBlend={!isDark}
          noiseIntensity={isDark ? 1 : 1.05}
          rotation={0}
        />
      </div>
    </div>
  );
}
