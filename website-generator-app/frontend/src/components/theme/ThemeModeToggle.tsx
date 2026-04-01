"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Check, Laptop, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ThemeMode = "light" | "dark" | "system"

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
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const mode: ThemeMode =
    theme === "light" || theme === "dark" || theme === "system"
      ? theme
      : "system"

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
          {renderModeIcon(mounted ? mode : "system")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} avoidCollisions={false} className="w-44 rounded-xl">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 size-4" />
          Light
          {mode === "light" ? <Check className="ml-auto size-4" /> : null}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 size-4" />
          Dark
          {mode === "dark" ? <Check className="ml-auto size-4" /> : null}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Laptop className="mr-2 size-4" />
          System
          {mode === "system" ? <Check className="ml-auto size-4" /> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
