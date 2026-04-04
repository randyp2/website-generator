import { cn } from "@/lib/utils"

interface MobilePortfolioMockupProps {
  variant: "tech" | "creative"
  className?: string
}

const TechPortfolio = () => {
  return (
    <div className="absolute inset-0 flex flex-col bg-zinc-950 text-white">
      {/* Matrix-style background characters */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden font-mono text-[8px] text-emerald-500/20">
        <span className="absolute left-[10%] top-[15%]">01101</span>
        <span className="absolute right-[15%] top-[20%]">{"</>"}</span>
        <span className="absolute left-[5%] top-[40%]">$_</span>
        <span className="absolute right-[8%] top-[35%]">0x4F</span>
        <span className="absolute left-[15%] top-[60%]">{"{ }"}</span>
        <span className="absolute right-[20%] top-[55%]">10010</span>
        <span className="absolute left-[8%] top-[80%]">::</span>
        <span className="absolute right-[12%] top-[75%]">{"=>"}</span>
        <span className="absolute left-[25%] top-[25%]">{"/*"}</span>
        <span className="absolute right-[25%] top-[70%]">{"*/"}</span>
        <span className="absolute left-[20%] top-[45%] text-[10px]">#</span>
        <span className="absolute right-[5%] top-[50%]">null</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="h-2 w-6 rounded-sm bg-emerald-500" />
        <div className="flex gap-0.5">
          <div className="h-0.5 w-3 rounded-full bg-white/40" />
          <div className="h-0.5 w-3 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col justify-center px-4">
        {/* Code-style intro */}
        <div className="mb-4 font-mono">
          <p className="text-[8px] text-zinc-500">{"// Hello, I'm"}</p>
          <h1 className="text-lg font-bold leading-tight text-white">
            Alex Chen
          </h1>
          <p className="mt-0.5 text-[10px] text-emerald-400">
            Full-Stack Developer
          </p>
        </div>

        {/* Stats row */}
        <div className="mb-4 flex gap-3">
          <div className="rounded-md bg-zinc-900 px-2 py-1.5">
            <p className="font-mono text-[10px] font-bold text-white">5+</p>
            <p className="text-[6px] text-zinc-500">Years</p>
          </div>
          <div className="rounded-md bg-zinc-900 px-2 py-1.5">
            <p className="font-mono text-[10px] font-bold text-white">50+</p>
            <p className="text-[6px] text-zinc-500">Projects</p>
          </div>
          <div className="rounded-md bg-zinc-900 px-2 py-1.5">
            <p className="font-mono text-[10px] font-bold text-emerald-400">
              Open
            </p>
            <p className="text-[6px] text-zinc-500">To Work</p>
          </div>
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1">
          {["React", "Node", "TypeScript", "AWS"].map((tech) => (
            <span
              key={tech}
              className="rounded border border-zinc-800 bg-zinc-900/50 px-1.5 py-0.5 font-mono text-[6px] text-zinc-400"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Footer with links */}
      <div className="border-t border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800">
              <span className="text-[8px]">GH</span>
            </div>
            <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800">
              <span className="text-[8px]">IN</span>
            </div>
          </div>
          <button className="rounded bg-emerald-500 px-3 py-1 text-[7px] font-medium text-black">
            Contact Me
          </button>
        </div>
      </div>
    </div>
  )
}

const CreativePortfolio = () => {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-zinc-950 text-white">
      {/* Gradient orb background */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-linear-to-br from-purple-500/30 via-pink-500/20 to-transparent blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-linear-to-tr from-blue-500/20 via-purple-500/10 to-transparent blur-2xl" />

      {/* Minimal nav */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-linear-to-r from-purple-400 to-pink-400" />
        <div className="flex gap-0.5">
          <div className="h-0.5 w-3 rounded-full bg-white/40" />
          <div className="h-0.5 w-3 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Hero content - centered */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center">
        {/* Avatar with gradient ring */}
        <div className="mb-3 rounded-full bg-linear-to-r from-purple-500 via-pink-500 to-orange-400 p-0.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950">
            <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-sm font-bold text-transparent">
              MR
            </span>
          </div>
        </div>

        <h1 className="text-base font-semibold tracking-tight">Maya Rivera</h1>
        <p className="mt-0.5 text-[9px] text-white/50">Product Designer</p>

        {/* Tagline */}
        <p className="mt-3 max-w-[140px] text-[8px] leading-relaxed text-white/70">
          Crafting digital experiences that connect brands with people
        </p>

        {/* CTA buttons */}
        <div className="mt-4 flex gap-2">
          <button className="rounded-full bg-linear-to-r from-purple-500 to-pink-500 px-4 py-1.5 text-[7px] font-medium text-white">
            View Portfolio
          </button>
          <button className="rounded-full border border-white/20 px-3 py-1.5 text-[7px] text-white/70">
            About
          </button>
        </div>
      </div>

      {/* Portfolio preview cards */}
      <div className="relative z-10 px-4 pb-4">
        <div className="flex gap-2">
          <div className="flex-1 overflow-hidden rounded-lg">
            <div className="aspect-4/3 bg-linear-to-br from-purple-600/40 to-pink-600/40" />
          </div>
          <div className="flex-1 overflow-hidden rounded-lg">
            <div className="aspect-4/3 bg-linear-to-br from-blue-600/40 to-purple-600/40" />
          </div>
          <div className="flex-1 overflow-hidden rounded-lg">
            <div className="aspect-4/3 bg-linear-to-br from-orange-600/40 to-pink-600/40" />
          </div>
        </div>
      </div>
    </div>
  )
}

export const MobilePortfolioMockup = ({
  variant,
  className,
}: MobilePortfolioMockupProps) => {
  return (
    <div className={cn("absolute inset-0", className)}>
      {variant === "tech" ? <TechPortfolio /> : <CreativePortfolio />}
    </div>
  )
}
