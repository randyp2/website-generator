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
import { cn } from "@/lib/utils"

type ThemeMode = "light" | "dark" | "system"

type ThemeModeToggleProps = {
  collapsed?: boolean
  className?: string
  variant?: "dropdown" | "inline"
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

function renderModeLabel(mode: ThemeMode) {
  switch (mode) {
    case "light":
      return "Light"
    case "dark":
      return "Dark"
    default:
      return "System"
  }
}

export function ThemeModeToggle({
  collapsed = false,
  className,
  variant = "dropdown",
}: ThemeModeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const mode: ThemeMode =
    theme === "light" || theme === "dark" || theme === "system"
      ? theme
      : "system"

  if (variant === "inline") {
    const themeModes: ThemeMode[] = ["light", "dark", "system"]

    return (
      <div className={cn("space-y-1", className)}>
        {themeModes.map((themeMode) => (
          <button
            key={themeMode}
            type="button"
            onClick={() => setTheme(themeMode)}
            className={cn(
              "flex w-full items-center rounded-md px-4 py-3 text-left text-sm transition-colors hover:bg-sidebar-accent/40",
              mode === themeMode
                ? "bg-sidebar-accent/50 text-sidebar-foreground"
                : "text-sidebar-foreground/80",
            )}
          >
            {renderModeIcon(themeMode)}
            <span className="ml-3">{renderModeLabel(themeMode)}</span>
            {mode === themeMode ? <Check className="ml-auto size-4" /> : null}
          </button>
        ))}
      </div>
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn(
            "rounded-md border border-sidebar-border bg-sidebar-accent/35 text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            collapsed
              ? "size-10"
              : "h-10 w-full justify-between px-3 text-sm font-medium",
            className,
          )}
          aria-label="Theme mode"
        >
          {renderModeIcon(mounted ? mode : "system")}
          {!collapsed ? (
            <>
              <span className="ml-2 flex-1 text-left">
                {renderModeLabel(mounted ? mode : "system")}
              </span>
              <span className="text-xs opacity-70">Change</span>
            </>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={collapsed ? "center" : "end"}
        sideOffset={10}
        avoidCollisions={false}
        className="w-44 rounded-xl"
      >
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
