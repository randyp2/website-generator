"use client"

import * as React from "react"
import { Check, Laptop, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ThemeMode = "light" | "dark" | "system"

const STORAGE_KEY = "portrn-theme-mode"

function getEffectiveTheme(mode: ThemeMode) {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }

  return mode
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement
  const effectiveTheme = getEffectiveTheme(mode)

  root.classList.remove("light", "dark")
  root.classList.add(effectiveTheme)
}

function renderModeIcon(mode: ThemeMode) {
  switch (mode) {
    case "light":
      return <Sun className="size-4" />
    case "dark":
      return <Moon className="size-4" />
    default:
      return <Laptop className="size-4" />
  }
}

export function ThemeModeToggle() {
  const [mode, setMode] = React.useState<ThemeMode>("system")

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const nextMode =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system"

    setMode(nextMode)
    applyTheme(nextMode)
  }, [])

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = () => {
      if (mode === "system") {
        applyTheme(mode)
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [mode])

  const updateMode = (nextMode: ThemeMode) => {
    setMode(nextMode)
    window.localStorage.setItem(STORAGE_KEY, nextMode)
    applyTheme(nextMode)
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 rounded-md border border-border/70 bg-background/80 hover:bg-accent/60"
          aria-label="Theme mode"
        >
          {renderModeIcon(mode)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} avoidCollisions={false} className="w-44 rounded-xl">
        <DropdownMenuItem onClick={() => updateMode("light")}>
          <Sun className="mr-2 size-4" />
          Light
          {mode === "light" ? <Check className="ml-auto size-4" /> : null}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateMode("dark")}>
          <Moon className="mr-2 size-4" />
          Dark
          {mode === "dark" ? <Check className="ml-auto size-4" /> : null}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateMode("system")}>
          <Laptop className="mr-2 size-4" />
          System
          {mode === "system" ? <Check className="ml-auto size-4" /> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
