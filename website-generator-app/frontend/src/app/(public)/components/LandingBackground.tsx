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
      {isDark ? (
        <div className="absolute inset-x-0 top-0 h-[72rem] w-full scale-110">
          <Silk
            speed={5}
            scale={0.95}
            color="#050a72"
            backgroundColor="#000000"
            noiseIntensity={1}
            rotation={0}
          />
        </div>
      ) : null}
    </div>
  );
}
